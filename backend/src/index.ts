import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";  // Import CORS

dotenv.config();

const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Allow the React frontend to connect
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,  // Allow credentials if needed
  }
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());  // Enable CORS for Express API

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

// WebSocket setup
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Emit a test message to the frontend when the connection is established
  socket.emit("message", "Welcome to the server!");

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
