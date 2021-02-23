import IORedis from 'ioredis';
import { Inject, Service } from 'typedi';
import { wrap } from 'src/utils/proxy';
import { IConfig } from 'config';
import { configToken } from 'src/container';

@Service()
export class CacheService {
	private readonly cacheInstance: Redis;

	constructor(@Inject(configToken) private readonly config: IConfig) {
		const redis = new IORedis(
			config.get('db.redis.host'),
			config.get('db.redis.port'),
			{
				password: config.get('db.redis.password'),
			}
		);
		this.cacheInstance = wrap(new RedisWrapper(redis), redis);
	}

	instance() {
		return this.cacheInstance;
	}

	close() {
		return this.cacheInstance.disconnect();
	}
}
export type Redis = RedisWrapper & IORedis.Redis;

class RedisWrapper {
	constructor(private readonly redis: IORedis.Redis) {}

	/**
	 * Set a key expiry time if it doesn't have one
	 * @param key: the redis key to set
	 * @param ttl: the time to live in seconds
	 */
	async setExpireIfNotExists(key: string, ttl: number) {
		const currentTtl = await this.redis.ttl(key);
		if (currentTtl === -1) {
			await this.redis.expire(key, ttl);
		}
	}
}
