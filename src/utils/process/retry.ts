import { sleep } from './sleep';

const alwaysRetry = () => true;

export class RetryProcessor {
	private retryDelay: number;
	private readonly maxRetries: number;
	private readonly retryStrategy: Function;
	private readonly retryOn: (error: Error) => boolean;

	constructor({
		maxRetries = 3,
		retryStrategy = RetryStrategy.FIXED,
		retryDelay = 500,
		retryOn = alwaysRetry,
	} = {}) {
		this.retryDelay = retryDelay;
		this.retryStrategy = retryStrategy;
		this.maxRetries = maxRetries;
		this.retryOn = retryOn;
	}

	async run(processor) {
		for (let i = 1; i <= this.maxRetries; i++) {
			try {
				const result = await processor();
				return {
					success: true,
					result: result,
				};
			} catch (e) {
				this.retryDelay = this.retryStrategy(this.retryDelay, i);
				if (i === this.maxRetries || !this.retryOn(e)) {
					return {
						success: false,
						error: e,
					};
				} else {
					await sleep(this.retryDelay);
				}
			}
		}
		return {
			success: false,
		};
	}
}

export const RetryStrategy = {
	FIXED(retryDelay) {
		return retryDelay;
	},
	RANDOM(retryDelay) {
		return Math.random() * retryDelay;
	},
	EXPONENTIAL(retryDelay, retryCount) {
		return retryDelay * Math.pow(2, retryCount);
	},
	NO_DELAY() {
		return 0;
	},
};
