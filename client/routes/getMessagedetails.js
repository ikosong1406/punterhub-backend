import express from "express";
import Chat from "../models/chat.schema.js"; // Import the Chat model

const router = express.Router();

router.post("/", async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "Missing required chat ID." });
  }

  try {
    // Find the chat by its ID and select the 'messages' field.
    const chat = await Chat.findById(chatId).select("messages");

    if (!chat) {
      return res.status(404).json({ message: "Chat thread not found." });
    }

    // Return the messages array
    res.status(200).json({
      message: "Conversation fetched successfully.",
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      message: "Failed to fetch conversation.",
      error: error.message,
    });
  }
});

export default router;