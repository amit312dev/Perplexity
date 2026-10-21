
import { io } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket = null;

export const initializeSocketConnection = () => {
  if (socket) {
    return socket;
  }

  socket = io(API_URL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to socket server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};
