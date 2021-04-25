const express = require('express');

const auth = require('../middlewares/auth');
const UserModel = require('../models/user');

const router = new express.Router();

router.route('/').post(async (req, res) => {
	console.log(req.body);

	const { name, age, email, password } = req.body;

	const user = new UserModel({ name, age, email, password });

	try {
		const newUser = await user.save();

		const token = await user.generateAuthToken();

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

			res.send(user);
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
		console.log(error);
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
