import { a, an, is, nested, nestedArray, schema } from 'yup-decorator';

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

@schema()
export class Email {
	@nested()
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
