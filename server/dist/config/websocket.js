"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const typedi_1 = __importDefault(require("typedi"));
const user_1 = require("../repositories/user");
let io;
let userRepository = typedi_1.default.get(user_1.UserRepository);
function initWebSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    console.log("Socket initialized!");
    io.on("connection", (socket) => {
        const onlineUsers = new Map();
        socket.on("loginUser", async (userId) => {
            try {
                const user = await userRepository.findById(userId);
                if (!user) {
                    console.log(`User not found: ${userId}`);
                    return;
                }
                socket.join(userId);
                onlineUsers.set(userId, socket.id);
                console.log(`User ${userId} is online`);
                io?.emit("userOnline", userId);
                io?.to(userId).emit("notification", {
                    type: "login",
                    message: `Hi ${user?.firstName} you are logged in successfully 🎉`,
                    timestamp: new Date()
                });
            }
            catch (error) {
                console.error("Socket Login error", error);
            }
        });
        socket.on("joinPool", (poolId) => {
            socket.join(poolId);
            console.log(`Socket joined pool: ${poolId}`);
        });
    });
}
function getIO() {
    if (!io)
        throw new Error("Socket.IO not initialized");
    return io;
}
//# sourceMappingURL=websocket.js.map