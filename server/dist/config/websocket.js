// import { Server } from "socket.io";
// import http from "http";
// import Container from "typedi";
// import { UserRepository } from "../repositories/user";
// let io: Server | undefined;
// let userRepository = Container.get(UserRepository);
// export function initWebSocket(server: http.Server){
//     io = new Server(server, {
//         cors: {
//             origin: "*",
//             methods: [ "GET", "POST"],
//         },
//     });
//     console.log("Socket initialized!");
//     io.on("connection", (socket) => {
//         const onlineUsers = new Map<string, string>();
//          socket.on("loginUser", async (userId: string) => {
//             try{
//             const user = await userRepository.findById(userId);
//             if(!user) {
//                 console.log(`User not found: ${userId}`);
//                 return;
//             }
//             socket.join(userId);
//             onlineUsers.set(userId, socket.id);
//             console.log(`User ${userId} is online`);
//             io?.emit("userOnline", userId);
//             io?.to(userId).emit("notification", {
//             type: "login",
//             message: `Hi ${user?.firstName} you are logged in successfully 🎉`,
//             timestamp: new Date()
//         });
//             } catch(error){
//                 console.error("Socket Login error", error);
//             }
//         });
//         socket.on("disconnect", () => {
//             for(const [userId, socketId] of onlineUsers.entries()){
//                 if(socketId === socket.id){
//                     onlineUsers.delete(userId);
//                     console.log(`User ${userId} is offline`);
//                     io?.emit("userOffline", userId);
//                     break;
//                 }
//             }
//         });
//     });
// }
// export function getIO(): Server {
//     if (!io) throw new Error("Socket.IO not initialized");
//     return io;
// }
//# sourceMappingURL=websocket.js.map