import { configToken, initContainer } from 'src/container';
import { EmailService } from 'src/email/services/email.service';
import { SQSEvent } from 'aws-lambda';
import { SqsService } from 'src/aws/sqs';

export async function handler(event: SQSEvent) {
	const container = await initContainer();
	const emailService = container.get(EmailService);
	const sqsService = container.get(SqsService);
	const config = container.get(configToken);
	const queueUrl: string = config.get('email.queueUrl');

	await sqsService.processMessages(queueUrl, event.Records, message => {
		return emailService.sendEmail(JSON.parse(message.body));
	});
}
