import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// ==================================================
// SEND MESSAGE
// ==================================================

export const sendMessage = async ({ message, chatId }) => {
  const response = await api.post("/api/chats/send", {
    message,
    chatId,
  });

  return response.data;
};

// ==================================================
// GET ALL CHATS
// ==================================================

export const getChats = async () => {
  const response = await api.get("/api/chats");

  return response.data;
};

// ==================================================
// GET MESSAGES
// ==================================================

export const getMessages = async (chatId) => {
  const response = await api.get(
    `/api/chats/${chatId}/messages`
  );

  return response.data;
};

// ==================================================
// DELETE CHAT
// ==================================================

export const deleteChat = async (chatId) => {
  const response = await api.delete(
    `/api/chats/${chatId}`
  );

  return response.data;
};