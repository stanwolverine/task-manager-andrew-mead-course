const sharp = require('sharp');
const express = require('express');

const auth = require('../middlewares/auth');
const UserModel = require('../models/user');
const avatarImageUpload = require('../middlewares/fileUpload');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account');

const router = new express.Router();

router.route('/').post(async (req, res) => {
	const { name, age, email, password } = req.body;

	const user = new UserModel({ name, age, email, password });

	try {
		const newUser = await user.save();

		const token = await user.generateAuthToken();

		sendWelcomeEmail(user);

		res.status(201).send({ user: newUser, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

router
	.route('/me')
	.get(auth, async (req, res) => {
		res.send(req.user);
	})
	.patch(auth, async (req, res) => {
		const updates = Object.keys(req.body);

		const allowedUpdates = ['name', 'email', 'age', 'password'];

		const isValidOperation = updates.every((update) =>
			allowedUpdates.includes(update),
		);

		if (!isValidOperation) {
			return res.status(401).send({ error: 'Invalid Updates!' });
		}

		try {
			const user = req.user;

			updates.forEach((update) => {
				user[update] = req.body[update];
			});

			const updatedUser = await user.save();

			res.send(updatedUser);
		} catch (error) {
			res.status(400).send(error);
		}
	})
	.delete(auth, async (req, res) => {
		try {
			const user = await req.user.remove();

			sendGoodbyeEmail(user);

			res.send(user);
		} catch (error) {
			res.status(500).send();
		}
	});

router
	.route('/me/avatar')
	.get(auth, async (req, res) => {
		if (!req.user.avatar) {
			return res.status(404).send();
		}
		res.set('Content-Type', 'image/png');
		res.send(req.user.avatar);
	})
	.post(
		auth,
		avatarImageUpload,
		async (req, res) => {
			try {
				const buffer = await sharp(req.file.buffer)
					.resize({ width: 250, height: 250 })
					.png()
					.toBuffer();

				req.user.avatar = buffer;

				await req.user.save();

				res.send();
			} catch (error) {
				res.status(500).send();
			}
		},
		(error, req, res, next) =>
			res.status(400).send({ error: error.message }),
	)
	.delete(auth, async (req, res) => {
		try {
			req.user.avatar = undefined;
			await req.user.save();
			res.send();
		} catch (error) {
			res.status(500).send();
		}
	});

router.route('/tasks').get(auth, async (req, res) => {
	try {
		const user = req.user;

		await user.populate('tasks').execPopulate();

		res.send({ tasks: user.tasks });
	} catch (error) {
		res.status(500).send(error);
	}
});

router.route('/login').post(async (req, res) => {
	try {
		const user = await UserModel.findByCredentials(
			req.body.email,
			req.body.password,
		);

		const token = await user.generateAuthToken();

		res.send({ user, token });
	} catch (error) {
		res.status(400).send(error.message);
	}
});

router.route('/logout').post(auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			(tokenObject) => tokenObject.token !== req.token,
		);

		await req.user.save();

		res.send();
	} catch (error) {
		res.status(500).send();
	}
});

router.route('/logoutAll').post(auth, async (req, res) => {
	try {
		req.user.tokens = [];

		await req.user.save();

		res.send();
	} catch (error) {
		res.status(500).send();
	}
});

module.exports = router;
