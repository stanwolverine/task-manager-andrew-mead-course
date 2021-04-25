const multer = require('multer');

const avatarMulter = multer({
	// dest: 'avatars', // We are not saving images to file system.
	limits: {
		fileSize: 1048576,
	},
	fileFilter(_req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload a valid Image.'));
		}

		cb(null, true);
	},
});

const avatarImageUpload = avatarMulter.single('avatar');

module.exports = avatarImageUpload;
