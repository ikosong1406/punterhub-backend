import express from "express";
import Chat from "../models/chat.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { id } = req.body;

    // Find all chats where the provided ID is either userId or punterId
    const chats = await Chat.find({
      $or: [{ userId: id }, { punterId: id }],
    })
      .populate("userId", "firstname lastname")
      .populate("punterId", "username")
      .lean();

    if (!chats || chats.length === 0) {
      return res.status(200).json({ chats: [] });
    }

    // Map through the chats to format the response
    const formattedChats = chats.map((chat) => {
      const latestMessage = chat.messages.slice(-1)[0];
      
      let opponentDetails = {};
      const requesterId = id.toString();

      // Determine the opponent's details
      if (chat.userId._id.toString() === requesterId) {
        // The requester is the 'user', the opponent is the 'punter'
        opponentDetails = {
          id: chat.punterId._id,
          username: chat.punterId.username,
        };
      } else {
        // The requester is the 'punter', the opponent is the 'user'
        opponentDetails = {
          id: chat.userId._id,
          fullname: `${chat.userId.firstname} ${chat.userId.lastname}`,
        };
      }

      return {
        chatId: chat._id,
        opponent: opponentDetails,
        latestMessage: latestMessage || null,
      };
    });

    res.status(200).json({ chats: formattedChats });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching chats.", error: error.message });
  }
});

export default router;