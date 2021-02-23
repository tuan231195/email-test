import 'semantic-ui-css/semantic.min.css';
import $ from 'jquery';
import './tinymce';
import './styles.scss';
import { validate as validateEmail } from 'email-validator';

let recipientIdx = 0;

$(function() {
	const form = $('form');
	const recipientList = $('#recipient-list');
	const addRecipient = $('#add-new-recipient');
	form.on('blur', 'input[required]', event => {
		const target = $(event.target);
		const isValid = validateRequiredField(target);
		const parent = target.parent();
		parent
			.toggleClass('error', !isValid)
			.attr('data-tooltip', isValid ? null : 'This field is required');
		checkForm();
	});

	form.on('blur', 'input[type=email]', event => {
		const target = $(event.target);
		const isValid = validateEmailField(target);
		const parent = target.parent();
		parent
			.toggleClass('error', !isValid)
			.attr('data-tooltip', isValid ? null : 'Invalid Email');
		checkForm();
	});

	form.on('click', '[data-element-name=remove-button]', event => {
		const button = $(event.target);
		const recipient = button.closest('[data-element-name=recipient]');
		recipient.remove();
		checkForm();
	});

	addRecipient.click(() => {
		const newRecipient = $('[data-element-name=recipient]')
			.eq(0)
			.clone();
		recipientIdx++;
		newRecipient
			.find('input')
			.val('')
			.attr('name', (index, attr) => `${attr}-${recipientIdx}`);
		newRecipient.find('select').val('to');
		newRecipient
			.find('[data-element-name=remove-button]')
			.prop('disabled', false);
		recipientList.append(newRecipient);
		checkForm();
	});

	const submitBtn = $('#submitBtn');
	submitBtn.click(() => {
		const senderName = $('#sender-name').val();
		const senderEmail = $('#sender-email').val();
		const subject = $('#subject').val();
		const body = tinyMCE.get('body').getContent({ format: 'html' });
		const recipients = {
			to: [],
			cc: [],
			bcc: [],
		};

		const recipientElements = recipientList.children();

		recipientElements.each((index, node) => {
			const recipientElement = $(node);
			const type = recipientElement.find('select').val();
			recipients[type].push({
				name: recipientElement
					.find('[data-element-name=recipient-name]')
					.val(),
				email: recipientElement
					.find('[data-element-name=recipient-email]')
					.val(),
			});
		});

		submitBtn.prop('disabled', true);

		fetch(`${process.env.API_URL}/email`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				body,
				subject,
				from: {
					name: senderName,
					email: senderEmail,
				},
				...recipients,
			}),
		})
			.then(response => {
				if (response.ok) {
					alert('Email sent successfully');
				} else {
					throw new Error(response);
				}
			})
			.catch(() => {
				alert('Email not sent');
			})
			.finally(() => {
				submitBtn.prop('disabled', false);
			});
	});

	function checkForm() {
		const checkers = [validateRequiredFields, validateEmailFields];

		const isFormValid = !checkers.some(checker => !checker());
		submitBtn.prop('disabled', !isFormValid);
	}

	function validateEmailFields() {
		return Array.from(form.find('input[required]')).every(
			validateRequiredField
		);
	}

	function validateRequiredFields() {
		return Array.from(form.find('input[type=email]')).every(
			validateEmailField
		);
	}

	function validateEmailField(target) {
		const fieldValue = $(target)
			.val()
			.trim();
		return validateEmail(fieldValue);
	}

	function validateRequiredField(target) {
		return (
			$(target)
				.val()
				.trim() !== ''
		);
	}
});
