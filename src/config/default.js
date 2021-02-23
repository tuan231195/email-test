require('dotenv').config();

module.exports = {
	logging: {
		logLevel: 'debug',
	},
	aws: {
		region: 'ap-southeast-2',
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
		queueUrl:
			'https://sqs.ap-southeast-2.amazonaws.com/923678104243/test-email-queue',
	},
	db: {
		redis: {
			host: 'localhost',
			port: 6379,
			password: '',
		},
	},
};
