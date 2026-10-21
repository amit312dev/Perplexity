
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors";
import chatRouter from "./routes/chat.routes.js";

const app = express();

// -------------------------
// CORS Configuration
// -------------------------

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as
      // server-to-server requests and direct health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// -------------------------
// Middlewares
// -------------------------

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------------
// Root Route
// -------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Perplexity API is running",
    status: "healthy",
  });
});

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
// API Routes
// -------------------------

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// -------------------------
// 404 Handler
// -------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// -------------------------
// Error Handler
// -------------------------

app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed by CORS",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal server error",
  });
});

export default app;
