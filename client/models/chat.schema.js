// models/Chat.js
import mongoose from 'mongoose';

// The sub-schema for individual messages
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "punter"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// The main schema for the conversation thread
const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  punterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [messageSchema], // This array stores the entire conversation history
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;