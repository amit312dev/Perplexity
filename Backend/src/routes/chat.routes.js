import { Router } from "express";

import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
} from "../controllers/chat.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const chatRouter = Router();

// Send a message
chatRouter.post("/send", verifyToken, sendMessage);

// Get all chats
chatRouter.get("/", verifyToken, getChats);

// Get messages of a particular chat
chatRouter.get("/:chatId/messages", verifyToken, getMessages);

// Delete a chat
chatRouter.delete("/:chatId", verifyToken, deleteChat);

export default chatRouter;