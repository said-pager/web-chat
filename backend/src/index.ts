import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { Client } from "pg";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Allow frontend to connect
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }
});

const PORT = process.env.PORT || 8000;

// PostgreSQL database connection setup with retry logic
const dbClient = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectWithRetry = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await dbClient.connect();
      console.log("Connected to PostgreSQL database");
      return;
    } catch (err) {
      console.error(`Failed to connect to PostgreSQL (attempt ${i + 1}/${retries})`, err);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  console.error("Could not connect to PostgreSQL after multiple attempts.");
};

connectWithRetry();

// Middleware
app.use(express.json());
app.use(cors());

// **API Route to Check Database Connection Status**
app.get("/status", async (req: Request, res: Response) => {
  try {
    await dbClient.query("SELECT 1"); // Simple query to check DB health
    res.json({ status: "connected" });
  } catch (error: unknown) {  // Explicitly declare error as unknown
    if (error instanceof Error) {
      res.json({ status: "disconnected", error: error.message });
    } else {
      res.json({ status: "disconnected", error: "Unknown error" });
    }
  }
});


// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

// WebSocket setup
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.emit("message", "Welcome to the server!");

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
