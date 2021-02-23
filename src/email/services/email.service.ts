import { Email } from 'src/email/models/email';
import { Inject, Service } from 'typedi';
import { LoggingService } from 'src/core/logging/services/logging.service';
import { EmailStatusService } from 'src/email/services/email-status.service';
import { MailAdapter } from 'src/email/adapters/email.adapter';
import { RetryProcessor, RetryStrategy } from 'src/utils/process/retry';
import { serviceUnavailable } from 'src/core/http/errors';
import { configToken } from 'src/container';
import { IConfig } from 'config';

@Service()
export class EmailService {
	constructor(
		@Inject() private readonly loggingService: LoggingService,
		@Inject() private readonly emailStatusService: EmailStatusService,
		@Inject(configToken) private readonly config: IConfig,
	) {}

	async sendEmail(email: Email) {
		let primaryService: MailAdapter | null = null;
		const retryProcessor = new RetryProcessor({
			maxRetries: 3,
			retryDelay: 2000,
			retryStrategy: RetryStrategy.EXPONENTIAL,
			retryOn: serviceUnavailable,
		});
		const { error } = await retryProcessor.run(async () => {
			try {
				primaryService = await this.emailStatusService.getPrimaryMailAdapter();
				await this.sendEmailWithService(email, primaryService);
			} catch (e) {
				if (primaryService) {
					const alternativeService = await this.emailStatusService.getAlternativeAdapter(
						primaryService.serviceName
					);
					if (alternativeService) {
						await this.sendEmailWithService(
							email,
							alternativeService
						);
						await this.checkServiceDownTime(
							primaryService,
							alternativeService
						);
					}
				} else {
					this.loggingService.error(`Failed to send email`, e);
					throw e;
				}
			}
		});
		if (error) {
			throw error;
		}
	}

	private async checkServiceDownTime(
		primaryService: MailAdapter,
		alternativeService: MailAdapter
	) {
		try {
			const [
				primaryServiceDownTime = 0,
				alternativeServiceDownTime = 0,
			] = await this.emailStatusService.getServicesDownTime([
				primaryService.serviceName,
				alternativeService.serviceName,
			]);
			// update the primary service if needed
			if (
				primaryServiceDownTime >
					Number(this.config.get('email.errorThreshold')) &&
				primaryServiceDownTime > alternativeServiceDownTime
			) {
				await this.emailStatusService.updatePrimaryService(
					alternativeService.serviceName
				);
			}
		} catch (e) {
			this.loggingService.error(`Failed to update the primary service`, e);
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
