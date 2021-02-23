import 'reflect-metadata';
import path from 'path';

process.env.NODE_CONFIG_DIR = path.resolve(__dirname, 'config');

import Container, { ContainerInstance, Token } from 'typedi';
import { resolveAsyncConfigs } from 'config/async';
import { IConfig } from 'config';
const config = require('config');

let containerPromise: Promise<ContainerInstance>;

export const configToken = new Token<IConfig>('config');

export async function initContainer() {
	if (containerPromise) {
		return containerPromise;
	}
	containerPromise = new Promise(async (resolve, reject) => {
		try {
			const container = Container.of();
			await resolveAsyncConfigs(config);
			container.set(configToken, config);
			console.log(config.get('email'));
			resolve(container);
		} catch (e) {
			reject(e);
		}
	});
	return containerPromise;
}
