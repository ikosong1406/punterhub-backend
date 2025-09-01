import express from "express";
import Chat from "../models/chat.schema.js";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, punterId, message, role } = req.body;

  if (!userId || !punterId || !message || !role) {
    return res
      .status(400)
      .json({ message: "Missing required message fields." });
  }

  try {
    // 1. Create a new message object
    const newMessage = {
      role: role,
      content: message,
      timestamp: new Date(),
    };

    // 2. Find an existing chat or create a new one
    let chat = await Chat.findOne({
      $or: [
        { userId: userId, punterId: punterId },
        { userId: punterId, punterId: userId },
      ],
    });

    if (!chat) {
      // If no chat exists, create a new one and save it
      chat = new Chat({
        userId: userId,
        punterId: punterId,
        messages: [newMessage],
      });
      await chat.save();

      // 3. Add the new chat ID to both user's and punter's 'chats' array
      await User.findByIdAndUpdate(
        userId,
        { $push: { chats: chat._id } },
        { new: true, useFindAndModify: false }
      );

      await User.findByIdAndUpdate(
        punterId,
        { $push: { chats: chat._id } },
        { new: true, useFindAndModify: false }
      );
    } else {
      // If chat exists, just push the new message into the messages array
      chat.messages.push(newMessage);
      await chat.save();
    }

    res.status(201).json({
      message: "Message sent successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      message: "Failed to send message.",
      error: error.message,
    });
  }
});

export default router;
