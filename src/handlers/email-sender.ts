import { configToken, initContainer } from 'src/container';
import { error, ok } from 'src/core/http/utils/response';
import { Email } from 'src/email/models/email';
import { validate } from 'yup-decorator';
import { sanitizeHtml } from 'src/utils/html/sanitize';
import { CustomValidationError } from 'src/core/errors/custom-validation-error';
import { SqsService } from 'src/aws/sqs';

export async function handler(event) {
	try {
		const container = await initContainer();
		const email = await verifySendInformation(JSON.parse(event.body));
		const sqsService = container.get(SqsService);
		const config = container.get(configToken);

		await sqsService.sendMessage(config.get('email.queueUrl'), email);

		return ok({ message: 'Email sent successfully' });
	} catch (e) {
		return error(e);
	}
}

async function verifySendInformation(emailContent): Promise<Email> {
	try {
		await validate({
			schemaName: Email,
			object: emailContent,
			options: {
				abortEarly: false,
			},
		});
		return {
			...emailContent,
			body: sanitizeHtml(emailContent.body),
		};
	} catch (e) {
		throw new CustomValidationError(e);
	}
}
