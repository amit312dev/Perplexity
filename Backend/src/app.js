import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors";
import chatRouter from "./routes/chat.routes.js";

const app = express();

// -------------------------
// Middlewares
// -------------------------

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// -------------------------
// Health Check
// -------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

// -------------------------
// Routes
// -------------------------

app.use("/api/auth", authRouter);

app.use("/api/chats", chatRouter);

export default app;