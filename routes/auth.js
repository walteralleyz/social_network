const router = require("express").Router(),
controller = require("../controller/auth.js"),
helpers = require("../helpers/index.js"),
user = require("../controller/user.js"),

{ signup, signin, signout } = controller,
{ userById } = user,
{ userSignupValidator } = helpers;

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

router.param("userId", userById);

module.exports = router;
