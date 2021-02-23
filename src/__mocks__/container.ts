import 'reflect-metadata';
import { mockConfig } from 'src/test/config';
import { LoggingService } from 'src/core/logging/services/logging.service';
import { SqsService } from 'src/aws/sqs';
import { createSpyObj } from 'jest-createspyobj';
import { configToken } from 'src/tokens';
import { EmailService } from 'src/email/services/email.service';

const instances = new Map();
const mockSqs = createSpyObj(SqsService);
const mockEmailService = createSpyObj(EmailService);

instances.set(configToken, mockConfig({}));
instances.set(EmailService, mockEmailService);
instances.set(LoggingService, console);
instances.set(SqsService, mockSqs);

export function initContainer() {
	return Promise.resolve({
		get(clazz) {
			return instances.get(clazz);
		},
	});
}
