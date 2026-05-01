const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const FriendRequest = require("../models/friendRequestModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // check if it's a 1-on-1 chat and users are still friends
  const chat = await Chat.findById(chatId);
  if (chat && !chat.isGroupChat) {
    const otherUserId = chat.users.find(
      (u) => u.toString() !== req.user._id.toString()
    );
    const friendship = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
      status: "accepted",
    });
    if (!friendship) {
      res.status(403);
      throw new Error("You are no longer friends");
    }
  }

  var newMessage = { sender: req.user._id, content, chat: chatId };

  try {
    var message = await Message.create(newMessage);
    message = await Message.findById(message._id)
      .populate("sender", "name pic")
      .populate({ path: "chat", populate: { path: "users", select: "name pic email" } });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
