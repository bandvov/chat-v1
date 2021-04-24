const {
  createChatroom,
  getAllChatrooms,
  deleteRoom,
} = require("../controllers/chatroom");
const { catchErrors } = require("../handlers/errorHandlers");
const { validateName } = require("../midlware/validators");
const auth = require("../midlware/auth");
const router = require("express").Router();

router.post("/", auth, validateName, catchErrors(createChatroom));

router.get("/", auth, catchErrors(getAllChatrooms));

router.delete("/delete-room", auth, catchErrors(deleteRoom));

module.exports = router;
