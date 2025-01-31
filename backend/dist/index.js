"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Set up Socket.IO with CORS support
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow frontend to connect
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    }
});
const PORT = process.env.PORT || 8000;
// PostgreSQL database connection setup with retry logic
const dbClient = new pg_1.Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
const connectWithRetry = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            yield dbClient.connect();
            console.log("Connected to PostgreSQL database");
            return;
        }
        catch (err) {
            console.error(`Failed to connect to PostgreSQL (attempt ${i + 1}/${retries})`, err);
            yield new Promise((res) => setTimeout(res, delay));
        }
    }
    console.error("Could not connect to PostgreSQL after multiple attempts.");
});
connectWithRetry();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// **API Route to Check Database Connection Status**
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbClient.query("SELECT 1"); // Simple query to check DB health
        res.json({ status: "connected" });
    }
    catch (error) { // Explicitly declare error as unknown
        if (error instanceof Error) {
            res.json({ status: "disconnected", error: error.message });
        }
        else {
            res.json({ status: "disconnected", error: "Unknown error" });
        }
    }
}));
// Basic route
app.get("/", (req, res) => {
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
