import { io } from "socket.io-client";
import { BACKEND_URL } from "../../../app/config";

let socket = null;

export const initializeSocketConnection = () => {
  if (socket) {
    return socket;
  }

  socket = io(BACKEND_URL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log(
      "Connected to socket server:",
      socket.id
    );
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  socket.on("connect_error", (error) => {
    console.error(
      "Socket connection error:",
      error.message
    );
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};