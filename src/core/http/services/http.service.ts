import { Service } from 'typedi';
import axios, { AxiosRequestConfig, AxiosStatic } from 'axios';
import querystring from 'querystring';
import { wrap } from 'src/utils/proxy';
import { omitBy } from 'lodash';

@Service()
export class HttpService {
	private readonly axios: AxiosStatic;
	private readonly httpClient: HttpClient;

	constructor() {
		this.axios = axios;
		const httpWrapper = new HttpWrapper(this.axios);
		this.httpClient = wrap(httpWrapper, this.axios);
	}

	instance() {
		return this.httpClient;
	}
}

class HttpWrapper {
	constructor(private readonly axios: AxiosStatic) {}

	postForm(
		url: string,
		formData: Record<string, any>,
		config: AxiosRequestConfig = {}
	) {
		const sanitizedForm = omitBy(formData, v => v == null);
		return this.axios.post(url, querystring.stringify(sanitizedForm), {
			...config,
			headers: {
				...config.headers,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
	}
}

export type HttpClient = HttpWrapper & AxiosStatic;
