import { Inject, InjectMany, Service } from 'typedi';
import { CacheService } from 'src/core/db/cache.service';
import {
	MailAdapter,
	mailAdapterToken,
} from 'src/email/adapters/email.adapter';
import { keyBy } from 'lodash';
import '../adapters/mailgun.adapter';
import '../adapters/sendgrid.adapter';
import { LoggingService } from 'src/core/logging/services/logging.service';

@Service()
export class EmailStatusService {
	private static keyPrefix = 'email:';
	private readonly adapterMap: Record<string, MailAdapter>;

	constructor(
		@Inject() private readonly cacheService: CacheService,
		@Inject() private readonly logger: LoggingService,
		@InjectMany(mailAdapterToken) private readonly adapters: MailAdapter[]
	) {
		this.adapterMap = keyBy(adapters, 'serviceName');
	}

	async getPrimaryMailAdapter() {
		const redisKey = EmailStatusService.primaryServiceKey();
		let primaryService = await this.cacheService.instance().get(redisKey);
		if (!primaryService || !this.adapterMap[primaryService]) {
			// use sendgrid by default
			primaryService = 'sendgrid';
		}
		return this.adapterMap[primaryService];
	}

	async getAlternativeAdapter(currentService?: string) {
		const services: Record<string, string> =
			(await this.cacheService
				.instance()
				.hgetall(EmailStatusService.serviceStatusKey())) || {};

		const sortedServices = Object.values(this.adapterMap).sort((a, b) => {
			const serviceADowntime = Number(services[a.serviceName] || 0);
			const serviceBDowntime = Number(services[b.serviceName] || 0);
			return serviceADowntime - serviceBDowntime;
		});
		return sortedServices.find(
			service => service.serviceName !== currentService
		);
	}

	async updateServiceDownTime(service: string) {
		const redis = this.cacheService.instance();
		const statusKey = EmailStatusService.serviceStatusKey();
		const serverDownTime = Number(redis.hincrby(statusKey, service, 1));

		// set status key to expire after 15 minutes
		await redis.setExpireIfNotExists(statusKey, 15 * 60);
		return serverDownTime;
	}

	async getServiceDownTime(service: string) {
		const redis = this.cacheService.instance();
		const statusKey = EmailStatusService.serviceStatusKey();
		return Number(redis.hget(statusKey, service) || 0);
	}

	async getServicesDownTime(services) {
		const redis = this.cacheService.instance();
		const statusKey = EmailStatusService.serviceStatusKey();
		const serviceDowntimes =
			(await redis.hmget(statusKey, ...services)) || [];
		return serviceDowntimes.filter(s => s != undefined).map(s => Number(s));
	}

	async updatePrimaryService(service: string) {
		this.logger.info(`Switching primary email service to ${service}`);
		const redisKey = EmailStatusService.primaryServiceKey();
		await this.cacheService.instance().set(redisKey, service);
	}

	private static primaryServiceKey() {
		return `${EmailStatusService.keyPrefix}primary`;
	}

	private static serviceStatusKey() {
		return `${EmailStatusService.keyPrefix}status`;
	}
}
