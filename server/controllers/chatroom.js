const Chatroom = require("../models/Chatroom");

module.exports.createChatroom = async (req, res) => {
  const { name, owner } = req.body;

  const chatRoomExist = await Chatroom.findOne({ name });
  if (chatRoomExist) throw "Chatroom with that name already exist";

  const chatRoom = new Chatroom({ name, owner, members: [owner] });
  await chatRoom.save();
  res.status(200).json({ message: `ChatRoom ${name} successfully created` });
};

module.exports.getAllChatrooms = async (req, res) => {
  const chatrooms = await Chatroom.aggregate([
    {
      $lookup: {
        from: "Message",
        localField: "_id",
        foreignField: "chatroom",
        as: "messages",
      },
    },
    {
      $addFields: { newestMessage: { $last: "$messages" } },
    },
  ]);

  return res.status(200).json({ chatrooms });
};

module.exports.deleteRoom = async (req, res) => {
  const { id } = req.body;
  const room = await Chatroom.findByIdAndDelete(id);
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  return res.status(200).json({ message: "Room successfully deleted" });
};
