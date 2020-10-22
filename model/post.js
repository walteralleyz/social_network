const mongoose = require("mongoose"),
{ObjectId} = mongoose.Schema,

postSchema = new mongoose.Schema({
	title: {
		type: String,
		require: "Title is required",
		minlength: 4,
		maxlegnth: 150
	},
	body: {
		type: String,
		require: "Body is required",
		minlength: 4,
		maxlegnth: 1000
	},
	photo: {
		data: Buffer,
		contentType: String
	},
	postedBy: {
		type: ObjectId,
		ref: "User"
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	likes: [{type: ObjectId, ref: "User"}],
	comments: [
		{
			text: {type: String},
			created: {type: Date, default: Date.now},
			postedBy: {type: ObjectId, ref: "User"}
		}
	]
});

module.exports = mongoose.model("Posts", postSchema);
