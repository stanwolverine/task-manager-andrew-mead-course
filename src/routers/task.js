const express = require('express');

const TaskModel = require('../models/task');
const auth = require('../middlewares/auth');

const router = new express.Router();

router
	.route('/')
	.post(auth, async (req, res) => {
		const { description, completed } = req.body;

		const task = new TaskModel({
			description,
			completed,
			owner: req.user._id,
		});

		try {
			const newTask = await task.save();
			res.status(201).send(newTask);
		} catch (error) {
			res.status(400).send(error);
		}
	})
	.get(auth, async (req, res) => {
		try {
			// 1st Option
			const tasks = await TaskModel.find({ owner: req.user._id });

			// 2nd Option
			// await req.user.populate('tasks').execPopulate();
			// const tasks = req.user.tasks;

			// // Valid
			// const tasks = await TaskModel.find({}).populate('owner').exec();
			// // Not valid, throws error.
			// const tasks = await TaskModel.find({})
			// 	.populate('owner')
			// 	.execPopulate();

			// // Not valid, throws error.
			// // As populate Method Is NOT AVAILABLE ON ARRAY. Its available on Document or Model.
			// await tasks.populate('owner').execPopulate();
			// // Valid
			// await tasks[0].populate('owner').execPopulate();
			// // Valid
			// await tasks[1].populate('owner').execPopulate();

			res.send(tasks);
		} catch (error) {
			console.log(error);
			res.status(500).send();
		}
	});

router
	.route('/:id')
	.get(auth, async (req, res) => {
		const { id } = req.params;

		try {
			const foundTask = await TaskModel.findOne({
				_id: id,
				owner: req.user._id.toString(),
			});

			if (!foundTask) {
				return res.status(404).send();
			}

			res.send(foundTask);
		} catch (error) {
			res.status(500).send();
		}
	})
	.patch(auth, async (req, res) => {
		try {
			const { id } = req.params;
			const updates = Object.keys(req.body);
			const allowedUpdates = ['description', 'completed'];

			const isValidOperation = updates.every((update) =>
				allowedUpdates.includes(update),
			);

			if (!isValidOperation) {
				return res.status(400).send({ error: 'Invalid Updates!' });
			}

			const task = await TaskModel.findOne({
				_id: id,
				owner: req.user._id,
			});

			if (!task) {
				return res.status(404).send();
			}

			updates.forEach((update) => {
				task[update] = req.body[update];
			});

			await task.save();

			res.send(task);
		} catch (error) {
			res.status(500).send();
		}
	})
	.delete(auth, async (req, res) => {
		try {
			const { id } = req.params;

			const task = await TaskModel.findOneAndDelete({
				_id: id,
				owner: req.user._id,
			});

			if (!task) {
				return res.status(404).send();
			}

			res.send(task);
		} catch (error) {
			res.status(500).send();
		}
	});

module.exports = router;
