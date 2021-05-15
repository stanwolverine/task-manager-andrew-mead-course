const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async ({ email, name }) => {
	try {
		await sgMail.send({
			to: email,
			from: 'jitu19nagar@gmail.com',
			subject: 'Thanks for joining in!',
			text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
		});

		console.log('Email sent');
	} catch (error) {
		console.error(error);

		return Promise.reject(error);
	}
};

const sendGoodbyeEmail = async ({ email, name }) => {
	try {
		await sgMail.send({
			to: email,
			from: 'jitu19nagar@gmail.com',
			subject: 'Good bye!',
			text: `Hello, ${name}. Please take a moment to tell us, what we did wrong.`,
		});

		console.log('Email sent');
	} catch (error) {
		console.error(error);

		return Promise.reject(error);
	}
};

module.exports = {
	sendWelcomeEmail,
	sendGoodbyeEmail,
};
