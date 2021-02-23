import { MailAdapter, mailAdapterToken } from 'src/email/adapters/email.adapter';
import { Email } from 'src/email/models/email';
import { Inject, Service } from 'typedi';
import { IConfig } from 'config';
import { HttpService } from 'src/core/http/services/http.service';
import { LoggingService } from 'src/core/logging/services/logging.service';
import { configToken } from 'src/container';

@Service({
	id: mailAdapterToken,
	multiple: true,
})
export class SendGridAdapter implements MailAdapter {
	private readonly mailUrl: string;
	private readonly apiToken: string;

	constructor(
		@Inject(configToken) config: IConfig,
		@Inject() private readonly httpService: HttpService,
		@Inject() private readonly loggingService: LoggingService
	) {
		this.mailUrl = 'https://api.sendgrid.com/v3/mail/send';
		this.apiToken = config.get('email.sendgrid.apiToken');
	}

	async sendEmail({
		from,
		to = [],
		bcc = [],
		cc = [],
		body,
		subject,
	}: Email) {
		this.loggingService.debug('Sending email using sendgrid');
		await this.httpService.instance().post(
			this.mailUrl,
			{
				personalizations: [
					{
						to,
						bcc: bcc.length ? bcc : undefined,
						cc: cc.length ? cc : undefined,
					},
				],
				from: { email: from.email, name: from.name },
				subject: subject,
				content: [{ type: 'text/html', value: body }],
			},
			{
				headers: {
					Authorization: `Bearer ${this.apiToken}`,
				},
			}
		);
	}

	serviceName = 'sendgrid';
}
