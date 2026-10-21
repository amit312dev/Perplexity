import axios from "axios";
import { BACKEND_URL } from "../../../app/config";

const api = axios.create({
  baseURL: BACKEND_URL,
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