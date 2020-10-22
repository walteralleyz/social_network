exports.createPostValidator = (req, res, next) => {
	req.check("title", "Write a title").not().isEmpty();
	req.check("title", "Title must be between 4 to 150 characters").isLength({
		min: 4,
		max: 150
	});

	req.check("body", "Write a body").not().isEmpty();
	req.check("body", "Body must be between 4 to 1000 characters").isLength({
		min: 4,
		max: 1000
	});

	const errors = req.validationErrors();
	if(errors) {
		const firstError = errors.map(error => error.msg);
		return res.status(400).json({ error: firstError[0] });
	}

	next();
};

exports.userSignupValidator = (req, res, next) => {
	req.check("name", "Name is required!").not().isEmpty();
	req.check("name", "Name must be between 4 and 10 characters.").isLength({
		min: 4,
		max: 10
	});

	req.check("email", "Email must be between 3 to 32 characters.")
	.matches(/.+\@.+\..+/)
	.withMessage("Email must contain @.")
	.isLength({
		min: 4,
		max: 200
	});

	req.check("password", "Password required!").not().isEmpty();
	req.check("password")
	.isLength({ min: 6 })
	.withMessage("Password must contain at least 6 characters!")
	.matches(/\d/)
	.withMessage("Password must contain a number");

	const errors = req.validationErrors();
	if(errors) {
		const firstError = errors.map(error => error.msg);
		return res.status(400).json({ error: firstError[0] });
	}

	next();
};
