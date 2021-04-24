const { register, login, getAllUsers } = require("../controllers/user");
const { catchErrors } = require("../handlers/errorHandlers");
const { validateEmail, validatePassword } = require("../midlware/validators");
const router = require("express").Router();
const auth = require("../midlware/auth");

router.post(
  "/register",
  validateEmail,
  validatePassword,
  catchErrors(register)
);
router.post("/login", validateEmail, validatePassword, catchErrors(login));
router.post("/get-all-users", auth, catchErrors(getAllUsers));

module.exports = router;
