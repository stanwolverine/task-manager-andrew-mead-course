const { Schema, model } = require('mongoose');

const TaskSchema = new Schema({
	description: {
		type: String,
		required: true,
		trim: true,
		minLength: [4, 'Provided description is too short.'],
	},
	completed: {
		type: Boolean,
		default: false,
	},
	owner: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
});

const TaskModel = model('Task', TaskSchema);

module.exports = TaskModel;
