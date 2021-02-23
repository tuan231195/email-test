import { handler } from './email-sender';
import testCase from '../email/adapters/test/test.case';
import { initContainer } from '../container';
import { SqsService } from '../aws/sqs';

jest.mock('src/container');

describe('Testing email.handler', () => {
	describe('Test input validation', () => {
		test('should return an error when the there is no sender details', async () => {
			const result = await handler({
				body: JSON.stringify({
					...testCase,
					from: {},
				}),
			});
			expect(result.statusCode).toEqual(400);
			expect(result).toMatchSnapshot();
		});

		test('should return an error when the there is no recipients', async () => {
			const result = await handler({
				body: JSON.stringify({
					...testCase,
					to: [],
				}),
			});
			expect(result.statusCode).toEqual(400);
			expect(result).toMatchSnapshot();
		});

		test('should return an error when sender email is incorrect', async () => {
			const result = await handler({
				body: JSON.stringify({
					...testCase,
					from: {
						name: 'a',
						email: 'vdtn359',
					},
				}),
			});
			expect(result.statusCode).toEqual(400);
			expect(result).toMatchSnapshot();
		});

		test('should return an error when recipient name is missing', async () => {
			const result = await handler({
				body: JSON.stringify({
					...testCase,
					from: {
						name: 'a',
						email: 'vdtn359@gmail.com',
					},
					to: [
						{
							email: 'vdtn359@gmail.com',
						},
					],
				}),
			});
			expect(result.statusCode).toEqual(400);
			expect(result).toMatchSnapshot();
		});

		test('should return an error when recipient email is incorrect', async () => {
			const result = await handler({
				body: JSON.stringify({
					...testCase,
					from: {
						name: 'a',
						email: 'vdtn359@gmail.com',
					},
					to: [
						{
							name: 'a',
							email: 'vdtn359',
						},
					],
				}),
			});
			expect(result.statusCode).toEqual(400);
			expect(result).toMatchSnapshot();
		});

		test('should sanitize body', async () => {
			const result = await handler({
				body: JSON.stringify({
					...testCase,
					body: '<script>bad</script>Test',
				}),
			});
			expect(result.statusCode).toEqual(200);
			expect(result).toMatchSnapshot();
			const container = await initContainer();
			const sqsService = container.get(SqsService);
			expect(sqsService.sendMessage).toHaveBeenCalled();
			expect(
				(sqsService.sendMessage as any).mock.calls
			).toMatchSnapshot();
		});
	});
});
