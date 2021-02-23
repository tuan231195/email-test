import { Email } from 'src/email/models/email';
import { Token } from 'typedi';

export interface MailAdapter {
	sendEmail(email: Email): Promise<void>;
	serviceName: string;
}

export const mailAdapterToken = new Token<MailAdapter>('mailAdapter');
