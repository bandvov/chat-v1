const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Name is required",
    },

    email: {
      type: String,
      required: "Email is required",
      unique: true,
    },

    password: {
      type: String,
      required: "Password is required",
    },

    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    chatrooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chatroom",
      },
    ],

    createDate: {
      type: Date,
      default: Date.now(),
    },

    avatar: String,
    active: { type: Boolean, default: true },
  },
  { timestamp: true }
);

module.exports = mongoose.model("User", userSchema, "User");
