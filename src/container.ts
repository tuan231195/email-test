import 'reflect-metadata';
import path from 'path';
import Container, { ContainerInstance } from 'typedi';
import { resolveAsyncConfigs } from 'config/async';
import { configToken } from 'src/tokens';

process.env.NODE_CONFIG_DIR = path.resolve(__dirname, 'config');

const config = require('config');

let containerPromise: Promise<ContainerInstance>;

export async function initContainer() {
	if (containerPromise) {
		return containerPromise;
	}
	containerPromise = new Promise(async (resolve, reject) => {
		try {
			const container = Container.of();
			await resolveAsyncConfigs(config);
			container.set(configToken, config);
			resolve(container);
		} catch (e) {
			reject(e);
		}
	});
	return containerPromise;
}
