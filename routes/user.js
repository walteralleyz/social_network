const router = require("express").Router(),
user = require("../controller/user.js"),
auth = require("../controller/auth.js"),

{ userById, 
allUsers, 
getUser, 
updateUser, 
deleteUser, 
userPhoto,
addFollowing,
addFollower,
removeFollowing,
removeFollower,
findPeople } = user,

{ requireSignin } = auth;

router.put("/follow", requireSignin, addFollowing, addFollower);
router.put("/unfollow", requireSignin, removeFollowing, removeFollower);
router.get("/", allUsers);
router.get("/:userId", requireSignin, getUser);
router.put("/:userId", requireSignin, updateUser);
router.delete("/:userId", requireSignin, deleteUser);
router.get("/findpeople/:userId", requireSignin, findPeople);

// photo
router.get("/photo/:userId", userPhoto);

router.param("userId", userById);

module.exports = router;
