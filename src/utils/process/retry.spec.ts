import { RetryProcessor } from './retry';

jest.mock('./sleep', () => {
	return {
		sleep: jest.fn(),
	};
});
import { sleep as sleepMock } from './sleep';

describe('Testing retryProcessor', () => {
	function getProcessor(options) {
		return new RetryProcessor(options);
	}
	test('should retry within the maximum number of trials', async () => {
		const retryProcessor = getProcessor({
			maxRetries: 3,
			retryDelay: 0,
		});
		const RESULT = 3;
		const processFunction = jest
			.fn()
			.mockImplementationOnce(() => {
				throw new Error();
			})
			.mockImplementation(() => RESULT);
		const { success, result } = await retryProcessor.run(processFunction);
		expect(processFunction).toHaveBeenCalledTimes(2);
		expect(success).toBeTruthy();
		expect(result).toBe(RESULT);
	});

	test('should return unsuccessful if exceed the maximum number of trials', async () => {
		const retryProcessor = getProcessor({
			maxRetries: 3,
			retryDelay: 0,
		});
		const processFunction = jest.fn().mockImplementation(() => {
			throw new Error();
		});

		const { success, error } = await retryProcessor.run(processFunction);
		expect(processFunction).toHaveBeenCalledTimes(3);
		expect(error).toBeDefined();
		expect(success).toBeFalsy();
	});

	test('should not retry if the error is not recoverable', async () => {
		const retryProcessor = getProcessor({
			maxRetries: 3,
			retryDelay: 0,
			retryOn(e) {
				return typeof e !== 'number';
			},
		});

		const processFunction = jest.fn().mockImplementation(() => {
			throw 4;
		});

		const { success, error } = await retryProcessor.run(processFunction);
		expect(processFunction).toHaveBeenCalledTimes(1);
		expect(error).toBeDefined();
		expect(success).toBeFalsy();
	});

	test('should invoke sleep with correct interval', async () => {
		const retryDelay = 300;

		const retryStrategy = jest.fn(() => retryDelay);

		const retryProcessor = getProcessor({
			maxRetries: 3,
			retryDelay,
			retryStrategy,
		});
		await retryProcessor.run(
			jest.fn().mockImplementationOnce(() => {
				throw 4;
			})
		);
		expect(retryStrategy).toHaveBeenCalledWith(
			retryDelay,
			expect.anything()
		);
		expect(sleepMock).toHaveBeenCalledWith(retryDelay);
	});
});
