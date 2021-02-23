import { LoggingService } from 'src/core/logging/services/logging.service';

export function mockLogger(): LoggingService {
	return {
		debug: jest.fn(),
		info: jest.fn(),
		error: jest.fn(),
	} as any;
}
