const Post = require("../model/post.js"),
fs = require("fs"),
_ = require("lodash"),
formidable = require("formidable");

exports.postById = (req, res, next, id) => {
	Post.findById(id)
	.populate("postedBy", "_id name")
	.populate("comments", "text created")
	.populate("comments.postedBy", "_id name")
	.exec((error, post) => {
		if(error || !post) return res.status(400).json(error);
		req.post = post;
		next();
	})
};

exports.getPosts = (req, res) => {
	const posts = Post.find()
	.populate("postedBy", "_id name")
	.populate("comments", "text created")
	.populate("comments.postedBy", "_id name")
	.select("_id title body created likes comments")
	.sort({created: -1})
	.then(post => {
		res.json(post);
	})
	.catch(error => res.status(400).json(error));
};

exports.createPost = (req, res, next) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err) return res.status(400).json({
			error: "Image couldnt be uploaded"
		});
		
		let obj = new Post(fields);
		
		req.profile.hashed_password = undefined;
		req.profile.salt = undefined;
		obj.postedBy = req.profile;

		if(files.photo) {
			obj.photo.data = fs.readFileSync(files.photo.path);
			obj.photo.contentType = files.photo.type;
		};
		
		obj.save((error, post) => {
			if(error) return res.status(400).json(error);
			res.json(post);
		});
	});
};

exports.postsByUser = (req, res) => {
	Post.find({postedBy: req.profile._id})
	.populate("postedBy", "_id name")
	.select("_id title body created likes")
	.sort("created")
	.exec((error, post) => {
		if(error) return res.status(400).json(error);
		res.json(post);
	});
};

exports.isPoster = (req, res, next) => {
	let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
	if(!isPoster) return res.status(403).json({ error: "User isnt authorized" });
	next();
};

exports.updatePost = (req, res, next) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err) return res.status(400).json({ 
			error: "Photo could not be uploaded!" 
		});

		let post = req.post;
		post = _.extend(post, fields);
		post.updated= Date.now();
		
		if(files.photo) {
			post.photo.data = fs.readFileSync(files.photo.path);
			post.photo.contentType = files.photo.type;
		};

		post.save((error, result) => {
			if(error) return res.status(400).json(error);
			res.json(post);
		});
	});
};

exports.deletePost = (req, res) => {
	let post = req.post;
	post.remove((error, post) => {
		if(error) return res.status(400).json(error);
		res.json({
			post: "Post deleted successfully!"
		});
	});
};

exports.postPhoto = (req, res, next) => {
	res.set("Content-Type", req.post.photo.contentType);
	return res.send(req.post.photo.data);
};

exports.singlePost = (req, res) => {
	return res.json(req.post);
};

exports.like = (req, res) => {
	Post.findByIdAndUpdate(req.body.postId, 
	{$push: {likes: req.body.userId}}, 
	{new: true})
	.exec((error, result) => {
		if(error) return res.status(400).json(error);
		res.json(result);
	});	
};

exports.unlike = (req, res) => {
	Post.findByIdAndUpdate(req.body.postId, 
	{$pull: {likes: req.body.userId}}, 
	{new: true})
	.exec((error, result) => {
		if(error) return res.status(400).json(error);
		res.json(result);
	});	
};

exports.comment = (req, res) => {
	let comment = req.body.comment;
	comment.postedBy = req.body.userId;

	Post.findByIdAndUpdate(req.body.postId, 
	{$push: {comments: comment}}, 
	{new: true})
	.populate("comments.postedBy", "_id name")
	.populate("postedBy", "_id name")
	.exec((error, result) => {
		if(error) return res.status(400).json(error);
		res.json(result);
	});	
};

exports.uncomment = (req, res) => {
	let comment = req.body.comment;

	Post.findByIdAndUpdate(req.body.postId, 
	{$pull: {comments: {_id: comment._id}}}, 
	{new: true})
	.populate("comments.postedBy", "_id name")
	.populate("postedBy", "_id name")
	.exec((error, result) => {
		if(error) return res.status(400).json(error);
		res.json(result);
	});	
};
