const { Schema, model } = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TaskSchema = require('./task');

const UserSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		age: {
			type: Number,
			default: 0,
			validate(value) {
				if (value < 0) {
					throw new Error('Age must be a positive number');
				}
			},
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			lowercase: true,
			required: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Email is invalid');
				}
			},
		},
		password: {
			type: String,
			required: true,
			minLength: 7,
			trim: true,
			validate(value) {
				if (value.toLowerCase().includes('password')) {
					throw new Error("Password must not contain 'password'");
				}
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
	},
	{ timestamps: true },
);

/**
 * These settings tell schema to include virtual properties whenever we invoke toObject or toJSON on Document.
 */
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner',
});

// UserSchema.pre('save', async function () {
// 	if (this.isModified('password')) {
// 		const hashedPassword = await bcrypt.hash(this.password, 8);
// 		this.password = hashedPassword;
// 	}
// });

UserSchema.pre('validate', function () {
	console.log('validate middleware');

	// new Promise((resolve, reject) => {
	// 	setTimeout(() => resolve(), 10000);
	// }).then(() => {
	// 	console.log('Function resolved');
	// });
});

UserSchema.pre('save', async function () {
	console.log('save middleware');
	if (this.isModified('password')) {
		const hashedPassword = await bcrypt.hash(this.password, 8);
		this.password = hashedPassword;
	}
});

UserSchema.pre('remove', async function () {
	const user = this;

	await TaskSchema.deleteMany({ owner: user._id.toString() });
});

UserSchema.static('findByCredentials', async function (email, password) {
	const user = await this.findOne({ email });

	if (!user) {
		throw new Error('Unable to login');
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new Error('Unable to login');
	}

	return user;
});

UserSchema.method('generateAuthToken', async function () {
	const user = this;

	const token = jwt.sign(
		{ _id: user._id.toString() },
		process.env.SECRET || 'thisismysecret',
		{
			expiresIn: '3d',
		},
	);

	user.tokens.push({ token });

	await user.save();

	return token;
});

UserSchema.method('toJSON', function () {
	const user = this;

	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;

	return userObject;
});

const UserModel = model('User', UserSchema);

module.exports = UserModel;
