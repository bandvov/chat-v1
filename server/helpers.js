const Message = require("./models/Message");
const Chatroom = require("./models/Chatroom");

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
  const isMember = foundChatRoom.members.includes(user);

  const updatedChatroom = await Chatroom.updateOne(
    { _id: chatroomId },
    {
      $addToSet: {
        members: user,
      },
    }
  );
  if (!updatedChatroom) {
    return { error: "Room does not exist" };
  }
  return { isMember };
};

module.exports.getUserRooms = async (userId) => {
  const chatrooms = await Chatroom.find({ members: { $in: [userId] } });
  return chatrooms;
};
