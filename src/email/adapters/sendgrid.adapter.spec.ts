import { mockConfig } from '../../test/config';
import { mockAxios } from '../../test/axios';
import { mockLogger } from '../../test/logger';
import testCase from './test/test.case';
import { SendGridAdapter } from './sendgrid.adapter';

jest.mock('config');

describe('Testing mailgun adapter', () => {
	let adapter: SendGridAdapter, axios;
	beforeEach(() => {
		axios = mockAxios();
		const httpClient: any = {
			instance() {
				return axios;
			},
		};

		const config = mockConfig({
			email: {
				sendgrid: {
					apiToken: 'token',
				},
			},
		});
		const logger = mockLogger();
		adapter = new SendGridAdapter(config, httpClient, logger);
	});

	test('Should call http client post with the right data', async () => {
		await adapter.sendEmail(testCase);
		expect(axios.post).toHaveBeenCalled();
		expect(axios.post.mock.calls).toMatchSnapshot();
	});
});
