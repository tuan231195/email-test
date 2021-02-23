import { Consumer } from 'sqs-consumer';
import { SQS } from 'aws-sdk';
import { Inject, Service } from 'typedi';
import { configToken, initContainer } from 'src/container';
import { IConfig } from 'config';
import { LoggingService } from 'src/core/logging/services/logging.service';
import { handler as workerHandler } from 'src/handlers/email-worker';

async function start() {
	const container = await initContainer();
	const worker = container.get(MockWorker);
	const config = container.get(configToken);
	const loggingService = container.get(LoggingService);
	const queueUrl: string = config.get('email.queueUrl');
	const listener = worker.registerListener({
		batchSize: 10,
		queueUrl,
		region: config.get('aws.region'),
		handleMessage: message => {
			const sqsEvent = worker.sqsMessageToLambdaEvent(
				message,
				worker.queueUrlToArn(queueUrl)
			);
			return workerHandler(sqsEvent);
		},
	});
	listener.start();
	loggingService.info('Worker started');
}

start();

@Service()
class MockWorker {
	constructor(
		@Inject(configToken) private readonly config: IConfig,
		@Inject() private readonly loggingService: LoggingService
	) {}

	registerListener({
		queueUrl,
		batchSize = 10,
		region = this.config.get('aws.region'),
		handleMessage,
	}: {
		queueUrl: string;
		region?: string;
		batchSize?: number;
		handleMessage: (message: SQS.Types.Message) => Promise<void>;
	}) {
		const listener = Consumer.create({
			queueUrl,
			region,
			batchSize,
			handleMessage,
		});

		listener.on('error', err =>
			this.loggingService.error('Queue error', err)
		);
		listener.on('processing_error', err =>
			this.loggingService.error('Processing error', err)
		);
		return listener;
	}

	sqsMessageToLambdaEvent(sqs: SQS.Message, eventSourceARN: string): any {
		return {
			Records: [
				{
					messageId: sqs.MessageId,
					receiptHandle: sqs.ReceiptHandle,
					body: sqs.Body,
					attributes: sqs.Attributes,
					messageAttributes: sqs.MessageAttributes,
					md5OfBody: sqs.MD5OfBody,
					eventSource: 'aws:sqs',
					eventSourceARN,
					awsRegion: this.config.get('aws.region'),
				},
			],
		};
	}

	queueUrlToArn(queueUrl: string) {
		const [match, region, accountNumber, queueName] =
			queueUrl.match(
				/^https:\/\/sqs\.(.+)\.amazonaws\.com\/(\d+)\/(.+)$/
			) || [];
		if (!match) {
			return '';
		}
		return `arn:aws:sqs:${region}:${accountNumber}:${queueName}`;
	}
}
