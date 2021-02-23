import { Inject, Service } from 'typedi';
import pino, { BaseLogger, LevelWithSilent } from 'pino';
import { IConfig } from 'config';
import { configToken } from 'src/container';

@Service()
export class LoggingService {
	private logger: BaseLogger;

	constructor(@Inject(configToken) private readonly config: IConfig) {
		this.logger = pino({
			prettyPrint: config.util.getEnv('NODE_CONFIG_ENV') !== 'production',
			level: config.get('logging.logLevel'),
			serializers: {
				err: pino.stdSerializers.err,
			},
		});
	}

	log(level: string, message: any, details: any = undefined) {
		const args = details ? [details, message] : [message];
		this.logger[level](...args);
	}

	info(message: any, details: any = undefined) {
		this.log('info', message, details);
	}

	debug(message: any, details: any = undefined) {
		this.log('debug', message, details);
	}

	error(message: any, error?: Error) {
		let errorDetails = {};
		if (error) {
			errorDetails = {
				message: error.message,
				stack: error.stack,
				response: (error as any).response?.data,
			};
		}
		this.logger.error({
			msg: message,
			err: errorDetails,
		});
	}
}
