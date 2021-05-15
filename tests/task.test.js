const request = require('supertest');

const app = require('../app');
const TaskModel = require('../src/models/task');
const { userOne, userTwo, setUpDatabase, taskOne } = require('./fixtures/db');

beforeEach(setUpDatabase);

test('should create task for a user', async () => {
	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ description: 'Completed Testing Videos.' })
		.expect(201);

	const task = await TaskModel.findById(response.body._id);

	expect(task).not.toBeNull();
	expect(task.completed).toBe(false);
});

test('should request all tasks for user one', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body.length).toBe(2);
});

test('should not delete other users task', async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);

	const task = await TaskModel.findById(taskOne._id);

	expect(task).not.toBeNull();
});
