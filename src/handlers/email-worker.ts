import { initContainer } from 'src/container';
import { EmailService } from 'src/email/services/email.service';
import { SQSEvent } from 'aws-lambda';
import { SqsService } from 'src/aws/sqs';
import { configToken } from 'src/tokens';

export async function handler(event: SQSEvent) {
	const container = await initContainer();
	const emailService = container.get(EmailService);
	const sqsService = container.get(SqsService);
	const config = container.get(configToken);
	const queueUrl: string = config.get('email.queueUrl');

	await sqsService.processMessages({
		queueUrl,
		messages: event.Records,
		handler: message => emailService.sendEmail(JSON.parse(message.body)),
	});
}
