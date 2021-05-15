const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');
const UserModel = require('../../src/models/user');
const TaskModel = require('../../src/models/task');

const userOneId = new Types.ObjectId();

const userOne = {
	_id: userOneId,
	name: 'Mike',
	email: 'mike@example.com',
	password: 'iammike',
	tokens: [
		{
			token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
		},
	],
};

const userTwoId = new Types.ObjectId();

const userTwo = {
	_id: userTwoId,
	name: 'Bhawu',
	email: 'bhawu@example.com',
	password: 'iambhawu',
	tokens: [
		{
			token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
		},
	],
};

const taskOne = {
	_id: new Types.ObjectId(),
	description: 'First task',
	completed: false,
	owner: userOneId,
};

const taskTwo = {
	_id: new Types.ObjectId(),
	description: 'Second task',
	completed: true,
	owner: userOneId,
};

const taskThree = {
	_id: new Types.ObjectId(),
	description: 'Third task',
	completed: false,
	owner: userTwoId,
};

const setUpDatabase = async () => {
	await UserModel.deleteMany();
	await TaskModel.deleteMany();
	await new UserModel(userOne).save();
	await new UserModel(userTwo).save();
	await new TaskModel(taskOne).save();
	await new TaskModel(taskTwo).save();
	await new TaskModel(taskThree).save();
};

module.exports = {
	userOneId,
	userOne,
	userTwoId,
	userTwo,
	taskOne,
	taskTwo,
	taskThree,
	setUpDatabase,
};
