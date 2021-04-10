const {
  createChatroom,
  getAllChatrooms,
  getUserChatrooms,
} = require("../controllers/chatroom");
const { catchErrors } = require("../handlers/errorHandlers");
const { validateName } = require("../midlware/validators");
const auth = require("../midlware/auth");
const router = require("express").Router();

router.post("/", auth, validateName, catchErrors(createChatroom));

router.get("/all-rooms", auth, catchErrors(getAllChatrooms));
router.get("/", auth, catchErrors(getUserChatrooms));

module.exports = router;
