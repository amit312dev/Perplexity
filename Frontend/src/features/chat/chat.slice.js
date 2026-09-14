import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  sendMessage as sendMessageApi,
  getChats as getChatsApi,
  getMessages as getMessagesApi,
  deleteChat as deleteChatApi,
} from "./service/chat.api";

// ==================================================
// FETCH CHATS
// ==================================================

export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getChatsApi();

      return data.chats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load chats."
      );
    }
  }
);

// ==================================================
// FETCH MESSAGES
// ==================================================

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const data = await getMessagesApi(chatId);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load messages."
      );
    }
  }
);

// ==================================================
// SEND MESSAGE
// ==================================================

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ message, chatId }, { rejectWithValue }) => {
    try {
      const data = await sendMessageApi({
        message,
        chatId,
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to send message."
      );
    }
  }
);

// ==================================================
// DELETE CHAT
// ==================================================

export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      const data = await deleteChatApi(chatId);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete chat."
      );
    }
  }
);

// ==================================================
// INITIAL STATE
// ==================================================

const initialState = {
  chats: [],
  messages: [],

  currentChatId: null,

  loading: false,
  messagesLoading: false,
  sendingMessage: false,

  error: null,
};

// ==================================================
// SLICE
// ==================================================

const chatSlice = createSlice({
  name: "chat",

  initialState,

  reducers: {
    // ----------------------------------------------
    // SET CURRENT CHAT
    // ----------------------------------------------

    setCurrentChat: (state, action) => {
      state.currentChatId = action.payload;
    },

    // ----------------------------------------------
    // CLEAR MESSAGES
    // ----------------------------------------------

    clearMessages: (state) => {
      state.messages = [];
      state.currentChatId = null;
    },

    // ----------------------------------------------
    // CLEAR ERROR
    // ----------------------------------------------

    clearChatError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ==================================================
    // FETCH CHATS
    // ==================================================

    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;

        state.chats = action.payload || [];
      })

      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to load chats.";
      });

    // ==================================================
    // FETCH MESSAGES
    // ==================================================

    builder
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;

        state.currentChatId =
          action.payload.chat.id;

        state.messages =
          action.payload.messages || [];
      })

      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;

        state.error =
          action.payload ||
          "Failed to load messages.";
      });

    // ==================================================
    // SEND MESSAGE
    // ==================================================

    builder
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;

        const data = action.payload;

        // ----------------------------------------------
        // Set current chat
        // ----------------------------------------------

        state.currentChatId = data.chat.id;

        // ----------------------------------------------
        // Add user message
        // ----------------------------------------------

        state.messages.push({
          id: data.userMessage.id,
          content: data.userMessage.content,
          role: data.userMessage.role,
        });

        // ----------------------------------------------
        // Add AI message
        // ----------------------------------------------

        state.messages.push({
          id: data.aiMessage.id,
          content: data.aiMessage.content,
          role: data.aiMessage.role,
        });

        // ----------------------------------------------
        // Update sidebar chat
        // ----------------------------------------------

        const existingChatIndex =
          state.chats.findIndex(
            (chat) => chat.id === data.chat.id
          );

        if (existingChatIndex !== -1) {
          state.chats[existingChatIndex] = {
            ...state.chats[existingChatIndex],
            title: data.chat.title,
            updatedAt: new Date().toISOString(),
          };
        } else {
          state.chats.unshift({
            id: data.chat.id,
            title: data.chat.title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // ----------------------------------------------
        // Put latest chat at top
        // ----------------------------------------------

        state.chats.sort(
          (a, b) =>
            new Date(b.updatedAt) -
            new Date(a.updatedAt)
        );
      })

      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;

        state.error =
          action.payload ||
          "Failed to send message.";
      });

    // ==================================================
    // DELETE CHAT
    // ==================================================

    builder
      .addCase(deleteChat.fulfilled, (state, action) => {
        const deletedChatId = action.payload.chatId;

        state.chats = state.chats.filter(
          (chat) => chat.id !== deletedChatId
        );

        if (state.currentChatId === deletedChatId) {
          state.currentChatId = null;
          state.messages = [];
        }
      })

      .addCase(deleteChat.rejected, (state, action) => {
        state.error =
          action.payload ||
          "Failed to delete chat.";
      });
  },
});

// ==================================================
// ACTIONS
// ==================================================

export const {
  setCurrentChat,
  clearMessages,
  clearChatError,
} = chatSlice.actions;

// ==================================================
// REDUCER
// ==================================================

export default chatSlice.reducer;