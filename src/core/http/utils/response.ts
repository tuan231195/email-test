import { INTERNAL_ERROR, OK } from 'src/core/http/errors/status-code';
import { CustomError } from 'src/core/errors/custom-error';
import { initContainer } from 'src/container';
import { LoggingService } from 'src/core/logging/services/logging.service';

export async function error(e: string | Error) {
	function failWithError({
		status,
		message,
	}: {
		status: number;
		message: string | object;
	}) {
		const errors =
			typeof message === 'string'
				? [
						{
							message,
						},
				  ]
				: message;
		return {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
			statusCode: status,
			body: JSON.stringify({ errors }),
		};
	}

	if (typeof e === 'string') {
		return failWithError({ status: INTERNAL_ERROR, message: e });
	}

	if (e instanceof CustomError) {
		return failWithError({
			status: e.statusCode,
			message: e.serializeErrors(),
		});
	}
	const status = (e as any).status || INTERNAL_ERROR;
	const isInternalServerError = status === INTERNAL_ERROR;
	if (isInternalServerError) {
		const container = await initContainer();
		const loggingService = container.get(LoggingService);
		loggingService.error('Internal server error', e);
	}
	return failWithError({
		status,
		message: isInternalServerError ? 'Internal server error' : e.message,
	});
}

export function ok(body, contentType = undefined) {
	return response(body, { contentType, statusCode: OK });
}

export function response(body, { statusCode, contentType }) {
	if (!contentType) {
		contentType =
			typeof body === 'object' ? 'application/json' : 'text/plain';
	}
	return {
		headers: {
			'Content-Type': contentType,
			'Access-Control-Allow-Origin': '*',
		},
		statusCode: statusCode,
		body:
			body && contentType === 'application/json'
				? JSON.stringify(body)
				: body,
	};
}
