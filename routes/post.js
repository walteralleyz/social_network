const router = require("express").Router(),
controller = require("../controller/post.js"),
auth = require("../controller/auth.js"),
helpers = require("../helpers"),
user = require("../controller/user.js"),

{ createPostValidator } = helpers,
{ userById } = user,

{ getPosts, 
createPost, 
postsByUser, 
postById, 
isPoster, 
deletePost, 
updatePost,
postPhoto,
singlePost,
like, unlike,
comment, uncomment } = controller,

{ requireSignin } = auth;

router.get("/", getPosts);

router.put("/like", requireSignin, like);
router.put("/unlike", requireSignin, unlike);


router.put("/comment", requireSignin, comment);
router.put("/uncomment", requireSignin, uncomment);


router.get("/photo/:postId", postPhoto);
router.get("/:postId", singlePost);
router.post("/new/:userId", requireSignin, createPost, createPostValidator);
router.get("/by/:userId", requireSignin, postsByUser); 
router.delete("/:postId", requireSignin, isPoster, deletePost);
router.put("/:postId", requireSignin, isPoster, updatePost);

router.param("userId", userById);
router.param("postId", postById);

module.exports = router;
