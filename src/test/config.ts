import { get } from 'lodash';
import { IConfig } from 'config';

export function mockConfig(initialObject): IConfig {
	return {
		util: {} as any,
		has(key): boolean {
			return !!get(initialObject, key);
		},
		get: function(key) {
			return get(initialObject, key);
		},
	};
}
