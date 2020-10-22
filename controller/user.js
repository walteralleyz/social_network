const User = require("../model/user.js"),
fs = require("fs"),
formidable = require("formidable"),
_ = require("lodash");

exports.userById = (req, res, next, id) => {
	User.findById(id)
	.populate("following", "_id name")
	.populate("followers", "_id name")
	.exec((error, user) => {
		if(error || !user) return res.status(400).json({ error: "User not found." });

		req.profile = user;
		next();
	});
};

exports.hasAuthorization = (req, res, next) => {
	const authorized = req.profile && req.auth && req.profile._id === req.auth._id;
	if(!authorized) return res.status(403).json({ error: "User is not authorized!" });
};

exports.allUsers = (req, res) => {
	User.find((error, user) => {
		if(error) return res.status(400).json(error);			
		res.json(user);
	}).select("name email created");
};

exports.getUser = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json({user: req.profile})
};

exports.updateUser = (req, res, next) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err) return res.status(400).json({ error: "Photo could not be uploaded!" });
		let user = req.profile;
		user = _.extend(user, fields);
		user.updated= Date.now();
		
		if(files.photo) {
			user.photo.data = fs.readFileSync(files.photo.path);
			user.photo.contentType = files.photo.type;
		};

		user.save((error, result) => {
			if(error) return res.status(400).json(error);
			user.hashed_password = undefined;
			user.salt = undefined;

			res.json(user);
		});
	});
};

exports.userPhoto = (req, res, next) => {
	if(req.profile.photo.data) {
		res.set({"Content-Type": req.profile.photo.contentType});
		return res.send(req.profile.photo.data);
	};
	next();
};

exports.deleteUser = (req, res, next) => {
	let user = req.profile;
	user.remove((error, user) => {
		if(error) return res.status(400).json(error);

		res.json({ message: "Your account was deleted!" });
	});
};

exports.addFollowing = (req, res, next) => {
	User.findByIdAndUpdate(
	req.body.userId, 
	{$push: {following: req.body.followId}}, 
	(error, result) => {
		if(error) return res.status(400).json(error);
		next();		
	});
};

exports.addFollower = (req, res) => {
	User.findByIdAndUpdate(
	req.body.followId, 
	{$push: {followers: req.body.userId}},
	{new: true})
	.populate("following", "_id name")
	.populate("followers", "_id name")
	.exec((error, result) => {
		if(error) return res.status(400).json(error);
		result.hashed_password = undefined;
		result.hashed_salt = undefined;
		res.json({user: result});
	});
};

exports.removeFollowing = (req, res, next) => {
	User.findByIdAndUpdate(
	req.body.userId, 
	{$pull: {following: req.body.unfollowId}}, 
	(error, result) => {
		if(error) return res.status(400).json(error);
		next();		
	});
};

exports.removeFollower = (req, res) => {
	User.findByIdAndUpdate(
	req.body.unfollowId, 
	{$pull: {followers: req.body.userId}},
	{new: true})
	.populate("following", "_id name")
	.populate("followers", "_id name")
	.exec((error, result) => {
		if(error) return res.status(400).json(error);
		result.hashed_password = undefined;
		result.hashed_salt = undefined;
		res.json({user: result});
	});
};

exports.findPeople = (req, res) => {
	let following = req.profile.following;
	following.push(req.profile._id);
	User.find({_id: {$nin: following}}, (error, user) => {
		if(error) return res.status(400).json(error);
		res.json(user);
	}).select("name");
};
