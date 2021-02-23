import { initContainer } from 'src/container';
import { EmailService } from 'src/email/services/email.service';

export async function send() {
	const container = await initContainer();
	const emailService = container.get(EmailService);
	await emailService.sendEmail({
		from: {
			name: 'Tuan',
			email: 'support@sg.vdtn359.com.au',
		},
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
