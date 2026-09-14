import { io } from "socket.io-client";

let socket = null;

export const initializeSocketConnection = () => {
  if (socket) {
    return socket;
  }

  socket = io("http://localhost:3000", {
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