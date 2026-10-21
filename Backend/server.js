import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/Config/database.js";
import { verifySMTPConnection } from "./src/services/mail.service.js";
import http from "http";
import { initSocketServer } from "./src/sockets/server.socket.js";

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

initSocketServer(httpServer);

const startServer = async () => {
  try {
    await connectDB();

    const smtpReady = await verifySMTPConnection();

    if (!smtpReady) {
      console.warn(
        "SMTP not available at startup, but server is still running"
      );
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
