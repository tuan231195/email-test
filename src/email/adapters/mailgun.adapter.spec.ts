import { MailgunAdapter } from './mailgun.adapter';
import { mockConfig } from '../../test/config';
import { mockAxios } from '../../test/axios';
import { mockLogger } from '../../test/logger';
import testCase from './test/test.case';

jest.mock('config');

describe('Testing mailgun adapter', () => {
	let adapter: MailgunAdapter, axios;
	beforeEach(() => {
		axios = mockAxios();
		const httpClient: any = {
			instance() {
				return axios;
			},
		};

		const config = mockConfig({
			email: {
				mailgun: {
					domain: 'test',
					apiToken: 'token',
				},
			},
		});
		const logger = mockLogger();
		adapter = new MailgunAdapter(config, httpClient, logger);
	});

	test('Should call http client post with the right data', async () => {
		await adapter.sendEmail(testCase);
		expect(axios.postForm).toHaveBeenCalled();
		expect(axios.postForm.mock.calls).toMatchSnapshot();
	});
});
