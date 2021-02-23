import { Email } from 'src/email/models/email';
import { Inject, Service } from 'typedi';
import { LoggingService } from 'src/core/logging/services/logging.service';
import { EmailStatusService } from 'src/email/services/email-status.service';
import { MailAdapter } from 'src/email/adapters/email.adapter';

@Service()
export class EmailService {
	constructor(
		@Inject() private readonly loggingService: LoggingService,
		@Inject() private readonly emailStatusService: EmailStatusService
	) {}

	async sendEmail(email: Email) {
		let primaryService: MailAdapter | null = null;
		try {
			primaryService = await this.emailStatusService.getPrimaryMailAdapter();
			await this.sendEmailWithService(email, primaryService);
		} catch (e) {
			if (primaryService) {
				const alternativeService = await this.emailStatusService.getAlternativeAdapter(
					primaryService.serviceName
				);
				if (alternativeService) {
					await this.sendEmailWithService(email, alternativeService);
					await this.checkServiceDownTime(
						primaryService,
						alternativeService
					);
				}
			} else {
				this.loggingService.error(`Failed to send email`, e);
			}
		}
	}

	private async checkServiceDownTime(
		primaryService: MailAdapter,
		alternativeService: MailAdapter
	) {
		const [
			primaryServiceDownTime = 0,
			alternativeServiceDownTime = 0,
		] = await this.emailStatusService.getServicesDownTime([
			primaryService.serviceName,
			alternativeService.serviceName,
		]);
		if (
			primaryServiceDownTime > 5 &&
			primaryServiceDownTime > alternativeServiceDownTime
		) {
			await this.emailStatusService.updatePrimaryService(
				alternativeService.serviceName
			);
		}
	}

	private async sendEmailWithService(email: Email, adapter: MailAdapter) {
		try {
			await adapter.sendEmail(email);
		} catch (e) {
			this.loggingService.error(
				`Failed to send email using service ${adapter.serviceName}`,
				e
			);
			await this.emailStatusService.updateServiceDownTime(
				adapter.serviceName
			);
			throw e;
		}
	}
}
