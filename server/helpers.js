const Message = require("./models/Message");
const Chatroom = require("./models/Chatroom");
const User = require("./models/User");

// save message to database
module.exports.saveMessage = async ({ user, chatroom, text }) => {
  if (!user) return { error: "User ID not provided" };
  if (!chatroom) return { error: "Chatroom ID not provided" };
  if (!text) return { error: "Message text not provided" };
  try {
    const newMessage = {
      user,
      chatroom,
      text,
    };
    const savedMessage = new Message(newMessage);
    await savedMessage.save();

    if (savedMessage) {
      return { savedMessage };
    }
  } catch (error) {
    if (error) {
      return { error };
    }
  }
};
// add user to chat room
module.exports.addUserToRoom = async ({ chatroomId, user }) => {
  const foundChatRoom = await Chatroom.findById(chatroomId);
  if (!foundChatRoom) {
    return { error: "Room does not exist" };
  }

  return await Chatroom.updateOne(
    { _id: chatroomId },
    {
      $addToSet: {
        members: user,
      },
    }
  );
};

module.exports.addContact = async ({ user, contact }) => {
  const checkUserContact = await User.find({
    _id: user,
    contacts: { $in: [contact] },
  });
  if (checkUserContact.length) {
    return { error: "Contact already added" };
  }
  const chatroom = new Chatroom({
    members: [user, contact],
    type: "private",
  });
  await User.findByIdAndUpdate(
    { _id: user },
    { $addToSet: { contacts: contact } }
  );
  await User.findByIdAndUpdate(
    { _id: contact },
    { $addToSet: { contacts: user } }
  );
  await chatroom.save();
  return { chatroom };
};

module.exports.checkIsMember = async ({ chatroomId, userId }) => {
  const isMember = await Chatroom.find({
    _id: chatroomId,
    members: { $in: [userId] },
  });
  return { isMember: isMember.length ? true : false };
};
