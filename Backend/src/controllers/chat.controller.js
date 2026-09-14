import {
  generateAIResponse,
  generateChatTitle,
} from "../services/ai.service.js";

import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

// ==================================================
// SEND MESSAGE
// ==================================================

export async function sendMessage(req, res) {
  try {
    const { message, chatId } = req.body ?? {};

    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------
    // Validate message
    // --------------------------------------------------

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const userMessage = message.trim();

    console.log("\n========================================");
    console.log("User ID:", userId);
    console.log("User Message:", userMessage);
    console.log("Chat ID:", chatId || "NEW CHAT");
    console.log("========================================\n");

    // --------------------------------------------------
    // Find existing chat OR create new chat
    // --------------------------------------------------

    let chat;

    if (chatId) {
      chat = await chatModel.findOne({
        _id: chatId,
        user: userId,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found.",
        });
      }

      console.log("Existing chat found:", chat._id);
    } else {
      const chatTitle = await generateChatTitle(userMessage);

      console.log("Generated Chat Title:", chatTitle);

      chat = await chatModel.create({
        user: userId,
        title: chatTitle,
      });

      console.log("New chat created:", chat._id);
    }

    // --------------------------------------------------
    // Get previous conversation history
    // --------------------------------------------------

    const previousMessages = await messageModel
      .find({
        chat: chat._id,
      })
      .sort({
        createdAt: 1,
      });

    console.log(
      "Previous messages:",
      previousMessages.length
    );

    // --------------------------------------------------
    // Convert MongoDB history to Gemini format
    // --------------------------------------------------

    const messageHistory = previousMessages.map((msg) => ({
      role: msg.role === "ai" ? "model" : "user",

      parts: [
        {
          text: msg.content,
        },
      ],
    }));

    // --------------------------------------------------
    // Save current user message
    // --------------------------------------------------

    const savedUserMessage = await messageModel.create({
      chat: chat._id,
      content: userMessage,
      role: "user",
    });

    console.log(
      "User message saved:",
      savedUserMessage._id
    );

    // --------------------------------------------------
    // Generate AI response
    // --------------------------------------------------

    const aiResponse = await generateAIResponse(
      userMessage,
      messageHistory
    );

    console.log("\nAI Response:");
    console.log(aiResponse);
    console.log();

    // --------------------------------------------------
    // Save AI message
    // --------------------------------------------------

    const savedAIMessage = await messageModel.create({
      chat: chat._id,
      content: aiResponse,
      role: "ai",
    });

    console.log(
      "AI message saved:",
      savedAIMessage._id
    );

    console.log("========================================\n");

    // --------------------------------------------------
    // Return response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      chat: {
        id: chat._id,
        title: chat.title,
      },

      userMessage: {
        id: savedUserMessage._id,
        content: savedUserMessage.content,
        role: savedUserMessage.role,
      },

      aiMessage: {
        id: savedAIMessage._id,
        content: savedAIMessage.content,
        role: savedAIMessage.role,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ==================================================
// GET ALL CHATS FOR LOGGED-IN USER
// ==================================================

export async function getChats(req, res) {
  try {
    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------
    // Find user's chats
    // --------------------------------------------------

    const chats = await chatModel
      .find({
        user: userId,
      })
      .sort({
        updatedAt: -1,
      });

    console.log(
      `Found ${chats.length} chats for user ${userId}`
    );

    // --------------------------------------------------
    // Return chats
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      chats: chats.map((chat) => ({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error getting chats:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ==================================================
// GET MESSAGES FOR A CHAT
// ==================================================

export async function getMessages(req, res) {
  try {
    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------
    // Get chatId from URL
    // --------------------------------------------------

    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    // --------------------------------------------------
    // Verify chat belongs to logged-in user
    // --------------------------------------------------

    const chat = await chatModel.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // --------------------------------------------------
    // Get messages
    // --------------------------------------------------

    const messages = await messageModel
      .find({
        chat: chatId,
      })
      .sort({
        createdAt: 1,
      });

    console.log(
      `Found ${messages.length} messages for chat ${chatId}`
    );

    // --------------------------------------------------
    // Return chat + messages
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      chat: {
        id: chat._id,
        title: chat.title,
      },

      messages: messages.map((msg) => ({
        id: msg._id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting messages:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ==================================================
// DELETE CHAT
// ==================================================

export async function deleteChat(req, res) {
  try {
    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------
    // Get chatId from URL
    // --------------------------------------------------

    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    // --------------------------------------------------
    // Check whether chat belongs to logged-in user
    // --------------------------------------------------

    const chat = await chatModel.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // --------------------------------------------------
    // Delete all messages belonging to this chat
    // --------------------------------------------------

    const deletedMessages = await messageModel.deleteMany({
      chat: chatId,
    });

    console.log(
      `Deleted ${deletedMessages.deletedCount} messages`
    );

    // --------------------------------------------------
    // Delete the chat
    // --------------------------------------------------

    await chatModel.deleteOne({
      _id: chatId,
    });

    console.log("Chat deleted:", chatId);

    // --------------------------------------------------
    // Send response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully.",
      chatId,
      deletedMessages: deletedMessages.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting chat:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}