import { SQSRecord } from 'aws-lambda';
import { Inject, Service } from 'typedi';
import AWS, { SQS } from 'aws-sdk';
import { chunk } from 'lodash';
import { LoggingService } from 'src/core/logging/services/logging.service';
import { v4 } from 'uuid';

@Service()
export class SqsService {
	private sqs: SQS;
	constructor(@Inject() private readonly loggingService: LoggingService) {
		this.sqs = new AWS.SQS({
			region: 'ap-southeast-2',
		});
	}

	async sendMessage(queueUrl: string, message: any, messageGroupId = v4()) {
		await this.sqs
			.sendMessage({
				QueueUrl: queueUrl,
				MessageBody: JSON.stringify(message),
				MessageGroupId: messageGroupId,
			})
			.promise();
	}

	async processMessages(
		queueUrl: string,
		messages: SQSRecord[],
		handler: (message: SQSRecord) => any
	) {
		// we are fine with processing multiple message groups in parallel. However, messages in the same group must be processed sequentially
		const processedResults = await Promise.all(
			messages.map(
				async message =>
					await this.processSingleMessage(message, handler)
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
		await this.deleteMessages(queueUrl, successMessages);
		this.loggingService.error(
			'The following message failed in this batch ' + failedMessageIds
		);
		throw new Error('Message Batch not processed successfully');
	}

	async processSingleMessage(
		message: SQSRecord,
		handler: (message: SQSRecord) => any
	) {
		try {
			const result = await handler(message);
			return { success: true, result, message };
		} catch (error) {
			return { success: false, error, message };
		}
	}

	async deleteMessages(queueUrl: string, messages: SQSRecord[]) {
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
