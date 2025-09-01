import express from "express";
import Chat from "../models/chat.schema.js"; // Correct import of the Chat model

const router = express.Router();

router.post("/", async (req, res) => {
  const { chatId, role, content } = req.body;

  if (!chatId || !role || !content) {
    return res
      .status(400)
      .json({ message: "Missing required message fields." });
  }

  try {
    const newMessage = {
      role, // 'user' or 'punter'
      content,
      timestamp: new Date(),
    }; // Find the chat by its ID and push the new message to its 'messages' array.

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: newMessage } },
      { new: true, runValidators: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat thread not found." });
    }

    res.status(201).json({
      message: "Message sent successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message to thread:", error);
    res.status(500).json({
      message: "Failed to send message.",
      error: error.message,
    });
  }
});

export default router;
