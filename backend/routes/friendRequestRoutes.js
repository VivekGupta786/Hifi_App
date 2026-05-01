const express = require("express");
const {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  getFriendStatus,
  unfriend,
} = require("../controllers/friendRequestControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send", protect, sendRequest);
router.get("/requests", protect, getRequests);
router.put("/accept", protect, acceptRequest);
router.put("/reject", protect, rejectRequest);
router.get("/status/:userId", protect, getFriendStatus);
router.delete("/:userId", protect, unfriend);

module.exports = router;
