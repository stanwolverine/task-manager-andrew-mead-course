const jwt = require('jsonwebtoken');

const UserModel = require('../models/user');

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');

		const payload = jwt.verify(token, process.env.JWT_SECRET);

		/**
		 * We used findOne method instead of findById
		 * because we also want to check if the provided token is also in user object.
		 * so, that user can't use the same token, after we have removed the token from user object.
		 * this is will useful for many cases like "logout".
		 */
		const user = await UserModel.findOne({
			_id: payload._id,
			'tokens.token': token,
		});

		if (!user) {
			throw new Error();
		}

		req.token = token;
		req.user = user;

		return next();
	} catch (error) {
		res.status(401).send({ error: 'Please authenticate!' });
	}
};

module.exports = auth;
