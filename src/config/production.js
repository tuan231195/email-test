const { asyncConfig } = require('./utils');
const environment = 'production';

module.exports = {
	logging: {
		logLevel: 'info',
	},
	email: {
		mailgun: {
			apiToken: asyncConfig(environment, 'email.mailgun.apiToken'),
			domain: asyncConfig(environment, 'email.mailgun.domain'),
		},
		sendgrid: {
			apiToken: asyncConfig(environment, 'email.sendgrid.apiToken'),
		},
	},
	db: {
		redis: {
			password: asyncConfig(environment, 'db.redis.password'),
			host: asyncConfig(environment, 'db.redis.host'),
			port: 16551,
		},
	},
};
