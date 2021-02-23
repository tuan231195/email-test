const AWS = require('aws-sdk');
const { get } = require('lodash');
const { asyncConfig: loadAsyncConfig } = require('config/async');

const secretsCache = {};

const secretsManager = new AWS.SecretsManager({
	region: 'ap-southeast-2',
});

exports.loadSecret = function(environment) {
	if (secretsCache[environment]) {
		return secretsCache[environment];
	}
	secretsCache[environment] = secretsManager
		.getSecretValue({
			SecretId: `secrets-${environment}`,
		})
		.promise()
		.then(({ SecretString: secret }) => JSON.parse(secret));
	return secretsCache[environment];
};

exports.getSecretKey = async function(environment, key) {
	const secret = await exports.loadSecret(environment);
	return get(secret, key);
};

exports.asyncConfig = function(environment, key) {
	return loadAsyncConfig(exports.getSecretKey(environment, key));
};
