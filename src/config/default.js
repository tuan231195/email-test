require('dotenv').config();

module.exports = {
	logging: {
		logLevel: 'debug',
	},
	email: {
		mailgun: {
			apiToken: process.env.MAILGUN_API_KEY,
			domain: process.env.MAILGUN_DOMAIN,
		},
		sendgrid: {
			apiToken: process.env.SENDGRID_API_KEY,
		},
		errorThreshold: 5,
	},
	db: {
		redis: {
			host: 'localhost',
			port: 6379,
			password: '',
		},
	},
};
