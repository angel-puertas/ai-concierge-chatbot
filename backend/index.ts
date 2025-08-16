import "dotenv/config"; // Load environment variables first
import express, { Express, Request, Response } from "express";
import chatRoutes from "./routes/chat.js";
import mongoose from "mongoose";
import payload from "payload";
import payloadConfig from "./payload.config.js";
import cors from "cors";

console.log("Starting server initialization...");

console.log("Initializing Express application...");
const app: Express = express();
const port = process.env.PORT;

// Initialize Payload CMS
console.log("Initializing Payload CMS...");
await payload.init({
  config: payloadConfig,
  // @ts-ignore
  express: app,
});
console.log("Payload CMS initialized successfully");

// MongoDB connection
console.log("Connecting to MongoDB...");
if (!process.env.DATABASE_URI) {
  throw new Error("DATABASE_URI is not defined in environment variables");
}
await mongoose.connect(process.env.DATABASE_URI);
console.log("MongoDB connected successfully");

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: allowedOrigin,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// App routes
console.log("Setting up routes...");
app.use("/api", chatRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Root API endpoint
app.get("/api", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Start Express server
const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
