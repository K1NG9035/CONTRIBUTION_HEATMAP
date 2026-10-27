import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { demoUser } from "./middleware/demoUser.js";
import { errorHandler } from "./middleware/errorHandler.js";
import habitRoutes from "./routes/habit.routes.js";

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Demo user attachment for habit scoping
app.use(demoUser);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main API routes
app.use("/api/habits", habitRoutes);

// 404 handler for undefined API routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Centralized error handler
app.use(errorHandler);

export default app;
