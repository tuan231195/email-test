import {
	BAD_GATEWAY,
	GATEWAY_TIMEOUT,
	SERVICE_UNAVAILABLE,
} from 'src/core/http/errors/status-code';

export function serviceUnavailable(e) {
	return (
		!!e.response &&
		[BAD_GATEWAY, SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT].includes(
			e.response.status
		)
	);
}
