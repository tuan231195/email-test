import { SQSRecord } from 'aws-lambda';
import { Inject, Service } from 'typedi';
import AWS, { SQS } from 'aws-sdk';
import { chunk } from 'lodash';
import { LoggingService } from 'src/core/logging/services/logging.service';
import { IConfig } from 'config';
import { configToken } from 'src/tokens';

@Service()
export class SqsService {
	private sqs: SQS;
	constructor(
		@Inject() private readonly loggingService: LoggingService,
		@Inject(configToken) private readonly config: IConfig
	) {
		this.sqs = new AWS.SQS({
			region: config.get('aws.region'),
		});
	}

	async sendMessage({
		queueUrl,
		message,
		messageGroupId = undefined,
	}: {
		queueUrl: string;
		message: any;
		messageGroupId?: string;
	}) {
		await this.sqs
			.sendMessage({
				QueueUrl: queueUrl,
				MessageBody: JSON.stringify(message),
				MessageGroupId: messageGroupId,
			})
			.promise();
	}

	async processMessages({
		queueUrl,
		messages,
		handler,
	}: {
		queueUrl: string;
		messages: SQSRecord[];
		handler: (message: SQSRecord) => any;
	}) {
		const processedResults = await Promise.all(
			messages.map(
				async message =>
					await this.processSingleMessage({ message, handler })
			)
		);

		const hasPartialFailures = processedResults.some(
			result => !result.success
		);
		if (!hasPartialFailures) {
			// no partial failures, let AWS handles message deletion
			return;
		}
		const successMessages = processedResults
			.filter(result => result.success)
			.map(result => result.message);
		const failedMessageIds = processedResults
			.filter(result => !result.success)
			.map(result => result.message.messageId);
		await this.deleteMessages({ queueUrl, messages: successMessages });
		this.loggingService.error(
			'The following message failed in this batch ' + failedMessageIds
		);
		throw new Error('Message Batch not processed successfully');
	}

	async processSingleMessage({
		message,
		handler,
	}: {
		message: SQSRecord;
		handler: (message: SQSRecord) => any;
	}) {
		try {
			const result = await handler(message);
			return { success: true, result, message };
		} catch (error) {
			return { success: false, error, message };
		}
	}

	async deleteMessages({
		queueUrl,
		messages,
	}: {
		queueUrl: string;
		messages: SQSRecord[];
	}) {
		if (!messages.length) {
			return;
		}
		// sqs can only delete up to 10 messages at a time
		const messageChunks = chunk(messages, 10);
		for (const messageChunk of messageChunks) {
			await this.sqs
				.deleteMessageBatch({
					Entries: messageChunk.map(message => ({
						Id: message.messageId,
						ReceiptHandle: message.receiptHandle,
					})),
					QueueUrl: queueUrl,
				})
				.promise();
		}
	}
}
