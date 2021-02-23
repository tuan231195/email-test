import { Inject, Service } from 'typedi';
import { IConfig } from 'config';
import { Email, Recipient } from 'src/email/models/email';
import { HttpService } from 'src/core/http/services/http.service';
import { LoggingService } from 'src/core/logging/services/logging.service';
import {
	MailAdapter,
	mailAdapterToken,
} from 'src/email/adapters/email.adapter';
import { configToken } from 'src/container';

@Service({
	id: mailAdapterToken,
	multiple: true,
})
export class MailgunAdapter implements MailAdapter {
	private readonly mailUrl: string;
	private readonly apiToken: string;
	private readonly domain: string;
	private readonly from: { name: string; email: string };

	constructor(
		@Inject(configToken) config: IConfig,
		@Inject() private readonly httpService: HttpService,
		@Inject() private readonly loggingService: LoggingService
	) {
		this.domain = config.get('email.mailgun.domain');
		this.apiToken = config.get('email.mailgun.apiToken');
		this.mailUrl = `https://api.mailgun.net/v3/${this.domain}/messages`;
		this.from = {
			name: 'Email test',
			email: 'support@mg.vdtn359.com.au',
		};
	}

	async sendEmail({ to, bcc = [], cc = [], body, subject }: Email) {
		this.loggingService.debug('Sending email using mailgun');

		await this.httpService.instance().postForm(
			this.mailUrl,
			{
				from: toRecipient(this.from),
				to: to.map(toRecipient).join(','),
				bcc: bcc.length ? bcc.map(toRecipient).join(',') : undefined,
				cc: cc.length ? cc.map(toRecipient).join(',') : undefined,
				html: body,
				subject,
			},
			{
				auth: {
					password: this.apiToken,
					username: 'api',
				},
			}
		);
	}

	serviceName = 'mailgun';
}

function toRecipient({ name, email }: Recipient) {
	return `${name} <${email}>`;
}
