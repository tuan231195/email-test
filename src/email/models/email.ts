import { a, an, is, nestedArray, schema } from 'yup-decorator';

@schema()
export class Email {
	@nestedArray(() => Recipient)
	from: Recipient;

	@nestedArray(
		() => Recipient,
		an.array().min(1, 'Email recipient is required')
	)
	to: Recipient[];

	@nestedArray(() => Recipient)
	cc?: Recipient[];

	@nestedArray(() => Recipient)
	bcc?: Recipient[];

	@is(a.string().required('Email subject is required'))
	subject: string;

	@is(a.string())
	body: string;
}

@schema()
export class Recipient {
	@is(a.string().required('Recipient name is required'))
	name: string;

	@is(
		a
			.string()
			.email('Not a valid email')
			.required('Recipient email is required')
	)
	email: string;
}
