const mongoose = require("mongoose");
const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: false,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  modifyTime: {
    type: Date,
    default: Date.now(),
  },
  createTime: {
    type: Date,
    default: Date.now(),
  },
  type: {
    type: String,
    enum: ["group", "private"],
    default: "group",
  },
});

module.exports = mongoose.model("Chatroom", chatroomSchema, "Chatroom");
