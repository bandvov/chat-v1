const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    chatroom: {
      type: mongoose.Schema.Types.ObjectId,
      required: "Chatroom is required",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: "User is required",
    },
    text: {
      type: String,
      required: "Message is required",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    createTime: {
      type: Date,
      default: Date.now(),
    },
    modifyTime: {
      type: Date,
      default: null,
    },
    readBy: {
      type: String,
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Message", messageSchema, "Message");
