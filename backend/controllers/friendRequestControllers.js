const asyncHandler = require("express-async-handler");
const FriendRequest = require("../models/friendRequestModel");

// POST /api/friend/send
const sendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  if (!receiverId) return res.sendStatus(400);

  const existing = await FriendRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
    status: "pending",
  });
  if (existing) return res.status(400).json({ message: "Request already sent" });

  const reverse = await FriendRequest.findOne({
    sender: receiverId,
    receiver: req.user._id,
    status: "accepted",
  });
  if (reverse) return res.status(400).json({ message: "Already friends" });

  const request = await FriendRequest.create({
    sender: req.user._id,
    receiver: receiverId,
  });

  const populated = await request.populate("sender", "name pic email");
  res.status(201).json(populated);
});

// GET /api/friend/requests  — incoming pending requests
const getRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    receiver: req.user._id,
    status: "pending",
  }).populate("sender", "name pic email");
  res.json(requests);
});

// PUT /api/friend/accept
const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const request = await FriendRequest.findById(requestId)
    .populate("sender", "name pic email")
    .populate("receiver", "name pic email");
  if (!request) return res.status(404).json({ message: "Request not found" });

  request.status = "accepted";
  await request.save();

  // notify the sender via socket
  const io = req.app.get("io");
  if (io) {
    io.to(request.sender._id.toString()).emit("friend request accepted", {
      acceptedBy: request.receiver,
    });
  }

  res.json(request);
});

// PUT /api/friend/reject
const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request) return res.status(404).json({ message: "Request not found" });

  request.status = "rejected";
  await request.save();
  res.json(request);
});

// GET /api/friend/status/:userId
const getFriendStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const request = await FriendRequest.findOne({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  });
  res.json({ status: request ? request.status : "none", requestId: request?._id, senderId: request?.sender });
});

// DELETE /api/friend/:userId — unfriend
const unfriend = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await FriendRequest.deleteOne({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
    status: "accepted",
  });
  res.json({ message: "Unfriended" });
});

module.exports = { sendRequest, getRequests, acceptRequest, rejectRequest, getFriendStatus, unfriend };
