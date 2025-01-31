"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors")); // Import CORS
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Set up Socket.IO with CORS support
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow the React frontend to connect
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true, // Allow credentials if needed
    }
});
const PORT = process.env.PORT || 8000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // Enable CORS for Express API
// Basic route
app.get("/", (req, res) => {
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
