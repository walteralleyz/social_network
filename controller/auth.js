const User = require("../model/user.js"),
jwt = require("jsonwebtoken"),
expressJwt = require("express-jwt"),
dotenv = require("dotenv").config();

exports.signup = async (req, res) => {
	const {email} = req.body;
	const userExists = await User.findOne({email})
	if(userExists) return res.status(403).json({
		error: "Email is taken!"
	});
	const user = await new User(req.body);
	await user.save();
	res.json({ message: "Signup success! Please login." });
};

exports.signin = (req, res) => {
	const {email, password} = req.body;
	User.findOne({email}, (err, user) => {
		if(err || !user) return res.status(401).json({
			error: "User with email does not exist. Please signin."
		});

		if(!user.authenticate(password)) return res.status(401).json({
			error: "Email and password dont match."
		});

		const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
		const {_id, name, email} = user;

		res.cookie("t", token, {expire: new Date() + 9999});
		return res.json({message: token, user: {_id, name, email}});
	});
};

exports.signout = (req, res) => {
	res.clearCookie("t");
	return res.json({ message: "Signout success!" });
};

exports.requireSignin = expressJwt({
	secret: process.env.JWT_SECRET,
	userProperty: "auth"
});
