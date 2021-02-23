import { initContainer } from 'src/container';
import { EmailService } from 'src/email/services/email.service';

export async function send() {
	const container = await initContainer();
	const emailService = container.get(EmailService);
	await emailService.sendEmail({
		subject: 'Test',
		to: [
			{
				name: 'Test',
				email: 'vdtn359@gmail.com',
			},
		],
		body: 'test',
	});
}

send();
