export function mockAxios() {
	return {
		get: jest.fn(),
		post: jest.fn(),
		postForm: jest.fn(),
	};
}
