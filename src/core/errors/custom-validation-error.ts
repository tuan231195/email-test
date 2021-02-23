import { CustomError } from './custom-error';
import { ValidationError } from 'yup';

export class CustomValidationError extends CustomError {
	statusCode = 400;

	constructor(private readonly yupValidationError: ValidationError) {
		super(yupValidationError.message);
		Object.setPrototypeOf(this, CustomValidationError.prototype);
	}

	serializeErrors(): { message: string; field?: string }[] {
		return this.yupValidationError.inner.map(inner => ({
			field: inner.path,
			message: inner.message,
		}));
	}
}
