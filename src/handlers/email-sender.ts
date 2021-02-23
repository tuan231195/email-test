import { initContainer } from 'src/container';
import { EmailService } from 'src/email/services/email.service';
import { error, ok } from 'src/core/http/utils/response';
import { Email } from 'src/email/models/email';
import { validate } from 'yup-decorator';
import { sanitizeHtml } from 'src/utils/html/sanitize';
import { CustomValidationError } from 'src/core/errors/custom-validation-error';

export async function handler(event) {
	try {
		const container = await initContainer();
		const email = await verifySendInformation(JSON.parse(event.body));
		const emailService = container.get(EmailService);
		await emailService.sendEmail(email);
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
