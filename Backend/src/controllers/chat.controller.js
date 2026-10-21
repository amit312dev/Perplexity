import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

import {
  generateAIResponse,
  generateChatTitle,
} from "../services/ai.service.js";

// ==================================================
// Send Message
// ==================================================

export const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    const userId = req.userId;

    console.log("\n========================================");
    console.log("User ID:", userId);
    console.log("User Message:", message);
    console.log(
      "Chat ID:",
      chatId || "NEW CHAT"
    );
    console.log("========================================\n");

    // ----------------------------------------------
    // Validation
    // ----------------------------------------------

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // ----------------------------------------------
    // Find or create chat
    // ----------------------------------------------

    let chat;

    if (chatId) {
      // Existing chat
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
    } else {
      // --------------------------------------------
      // New chat
      // --------------------------------------------

      let title = "New Chat";

      // Try generating AI title.
      // If Gemini is unavailable, don't break chat.
      try {
        title = await generateChatTitle(
          message.trim()
        );
      } catch (titleError) {
        console.error(
          "Title generation failed. Using fallback title."
        );

        console.error(
          titleError.message
        );

        // Fallback title from user's message
        title = message
          .trim()
          .split(/\s+/)
          .slice(0, 6)
          .join(" ");

        if (!title) {
          title = "New Chat";
        }
      }

      // Create chat
      chat = await chatModel.create({
        user: userId,
        title,
      });
    }

    // ----------------------------------------------
    // Get previous messages
    // ----------------------------------------------

    const previousMessages =
      await messageModel
        .find({
          chat: chat._id,
        })
        .sort({ createdAt: 1 });

    // ----------------------------------------------
    // Convert messages for Gemini history
    // ----------------------------------------------

    const messageHistory =
      previousMessages.map((msg) => ({
        role:
          msg.role === "ai"
            ? "model"
            : "user",

        parts: [
          {
            text: msg.content,
          },
        ],
      }));

    // ----------------------------------------------
    // Save user message
    // ----------------------------------------------

    const userMessage =
      await messageModel.create({
        chat: chat._id,
        content: message.trim(),
        role: "user",
      });

    // ----------------------------------------------
    // Generate AI response
    // ----------------------------------------------

    let aiText;

    try {
      aiText = await generateAIResponse(
        message.trim(),
        messageHistory
      );
    } catch (aiError) {
      console.error(
        "AI response generation failed:"
      );

      console.error(aiError);

      // ------------------------------------------
      // Remove user message if AI failed
      // ------------------------------------------
      await messageModel.findByIdAndDelete(
        userMessage._id
      );

      return res.status(503).json({
        success: false,
        message:
          "AI service is temporarily unavailable. Please try again later.",
      });
    }

    // ----------------------------------------------
    // Save AI message
    // ----------------------------------------------

    const aiMessage =
      await messageModel.create({
        chat: chat._id,
        content: aiText,
        role: "ai",
      });

    // ----------------------------------------------
    // Update chat timestamp
    // ----------------------------------------------

    chat.updatedAt = new Date();

    await chat.save();

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(200).json({
      success: true,

      chat: {
        id: chat._id,
        title: chat.title,
      },

      userMessage: {
        id: userMessage._id,
        content: userMessage.content,
        role: userMessage.role,
      },

      aiMessage: {
        id: aiMessage._id,
        content: aiMessage.content,
        role: aiMessage.role,
      },
    });
  } catch (error) {
    console.error(
      "Error sending message:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while sending the message.",
    });
  }
};

// ==================================================
// Get Chats
// ==================================================

export const getChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await chatModel
      .find({ user: userId })
      .sort({ updatedAt: -1 });

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
    console.error(
      "Error fetching chats:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats.",
    });
  }
};

// ==================================================
// Get Messages
// ==================================================

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const userId = req.userId;

    // ----------------------------------------------
    // Check chat belongs to user
    // ----------------------------------------------

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

    // ----------------------------------------------
    // Get messages
    // ----------------------------------------------

    const messages =
      await messageModel
        .find({
          chat: chatId,
        })
        .sort({ createdAt: 1 });

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
    console.error(
      "Error fetching messages:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch messages.",
    });
  }
};

// ==================================================
// Delete Chat
// ==================================================

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const userId = req.userId;

    // ----------------------------------------------
    // Check chat belongs to user
    // ----------------------------------------------

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

    // ----------------------------------------------
    // Delete messages
    // ----------------------------------------------

    await messageModel.deleteMany({
      chat: chatId,
    });

    // ----------------------------------------------
    // Delete chat
    // ----------------------------------------------

    await chatModel.findByIdAndDelete(
      chatId
    );

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully.",
      chatId,
    });
  } catch (error) {
    console.error(
      "Error deleting chat:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete chat.",
    });
  }
};