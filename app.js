require('./src/db/mongoose');

const express = require('express');

const UserRouter = require('./src/routers/user');
const TaskRouter = require('./src/routers/task');

const app = express();

app.use(express.json());

app.use((_req, res, next) => {
	if (process.env.UNDER_MAINTENANCE) {
		return res
			.status(503)
			.send({ error: 'Server is under maintenance. Try again later.' });
	}

	next();
});

app.use('/users', UserRouter);

app.use('/tasks', TaskRouter);

const port = process.env.PORT;

app.listen(port, () => console.info('Server started on port ', port));
