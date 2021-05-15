const request = require('supertest');

const app = require('../app');
const UserModel = require('../src/models/user');
const { userOne, setUpDatabase } = require('./fixtures/db');

beforeEach(setUpDatabase);

test('should signup a new user', async () => {
	const response = await request(app)
		.post('/users')
		.send({
			name: 'Jatin Nagar',
			email: 'jitu19nagar@gmail.com',
			password: 'MyPass123!',
		})
		.expect(201);

	// Can check other things also, to make sure your test passed.

	// Assert that the database was changed correctly
	const user = await UserModel.findById(response.body.user._id);
	expect(user).not.toBeNull();

	// Assertions about the response.
	expect(response.body).toMatchObject({
		user: {
			name: 'Jatin Nagar',
			email: 'jitu19nagar@gmail.com',
		},
		token: user.tokens[0].token,
	});

	// Check if plain password was stored in database.
	expect(user.password).not.toBe('MyPass123!');
});

test('should login existing user', async () => {
	const response = await request(app)
		.post('/users/login')
		.send({
			email: userOne.email,
			password: userOne.password,
		})
		.expect(200);

	// Validating that new token is saved in database.
	const user = await UserModel.findById(response.body.user._id);
	expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login nonexistent user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: 'xyz@gmail.com',
			password: 'helloiamxyz',
		})
		.expect(400);
});

test('should get profile for user', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);
});

test('should not get profile for unauthenticated user', async () => {
	await request(app).get('/users/me').send().expect(401);
});

test('should delete account for user', async () => {
	const response = await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	// Validating user is removed from database.
	const user = await UserModel.findById(response.body._id);
	expect(user).toBeNull();
});

test('should not delete account for unauthenticated user', async () => {
	await request(app).delete('/users/me').send().expect(401);
});

test('should upload avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(200);

	const user = await UserModel.findById(userOne._id);

	expect(user.avatar).toEqual(expect.any(Buffer));
});

test('should not upload avatar image of an unauthenticated user', async () => {
	await request(app)
		.post('/users/me/avatar')
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(401);
});

test('should not upload large avatar image', async () => {
	await request(app)
		.post('/users/avatar/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/large-image.jpg')
		.expect(404);
});

test('should update valid user fields', async () => {
	const updatedName = 'Jitu Choudhary';

	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ name: updatedName })
		.expect(200);

	const user = await UserModel.findById(userOne._id);

	expect(user.name).toBe(updatedName);
});

test('should not update invalid user fields', async () => {
	const invalidFields = {
		location: 'Shahdara, Delhi',
	};

	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send(invalidFields)
		.expect(401);
});
