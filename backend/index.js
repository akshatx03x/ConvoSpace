import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoute.js';
import fileRoutes from './routes/fileRoute.js';
import geminiRoutes from './routes/geminiRoute.js';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/UserModel.js';
import { deleteAllFiles } from './controllers/fileController.js';

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "https://convospace-mu.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    sameSite: 'None',
}));
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { })
        console.log("MongoDB connected");
    }
    
    catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;

app.use('/', authRoutes);
app.use('/gemini', geminiRoutes);
app.use('/', fileRoutes);
app.get('/', (req, res) => {
    res.send('API is running...');
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL || "http://localhost:5173",
            "https://convospace-mu.vercel.app"
        ],
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Make io accessible in routes
app.set('io', io);

const emailtoSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const roomUsers = new Map(); // Track users per room
const activeRooms = new Set(); // Track active rooms/meetings

io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        socket.disconnect();
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            socket.disconnect();
            return;
        }
        socket.user = user;
    } catch (err) {
        socket.disconnect();
        return;
    }

    socket.on("room:join", (data) => {
        const { room } = data;
        const email = socket.user.email;

        // Check if user is already in this room
        if (roomUsers.has(room)) {
            const usersInRoom = roomUsers.get(room);
            for (const userId of usersInRoom) {
                const userEmail = socketIdToEmailMap.get(userId);
                if (userEmail === email) {
                    io.to(socket.id).emit("room:join:error", { message: "You are already in this room." });
                    return;
                }
            }
        }

        // Check if this is a new room or existing active room
        if (!roomUsers.has(room)) {
            // New room being created
            activeRooms.add(room);
        } else if (!activeRooms.has(room)) {
            // Room exists but not active
            io.to(socket.id).emit("room:join:error", { message: "No active meeting found for this room code. Please create a new room or wait for the meeting to start." });
            return;
        }

        socket.join(room);
        emailtoSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        // Track users in room
        if (!roomUsers.has(room)) {
            roomUsers.set(room, new Set());
        }
        roomUsers.get(room).add(socket.id);

        // Notify all existing users in room about the new user
        socket.to(room).emit("user:join", { email, id: socket.id });

        // Notify the new user about all existing users in the room
        const existingUsers = roomUsers.get(room);
        for (const userId of existingUsers) {
            if (userId !== socket.id) {
                const userEmail = socketIdToEmailMap.get(userId);
                io.to(socket.id).emit("user:join", { email: userEmail, id: userId });
            }
        }

        io.to(socket.id).emit("room:join", { email, room });
    });

    socket.on("disconnect", async () => {
        console.log(`User with ID: ${socket.id} disconnected`);

        // Remove user from room tracking
        for (const [room, users] of roomUsers.entries()) {
            if (users.has(socket.id)) {
                users.delete(socket.id);
                // Notify other users in the room that this user left
                socket.to(room).emit('user:left', { id: socket.id });
                // If room is empty, delete all files for that room and remove from active rooms
                if (users.size === 0) {
                    roomUsers.delete(room);
                    activeRooms.delete(room); // Remove from active rooms
                    try {
                        // Create a mock request object for the controller
                        const mockReq = {
                            query: { room },
                            app: app // Pass the app instance to access io if needed
                        };
                        const mockRes = {
                            status: (code) => ({
                                json: (data) => {
                                    if (code === 200) {
                                        console.log(`All files deleted for empty room: ${room}`);
                                    } else {
                                        console.error(`Failed to delete files for room: ${room}`, data);
                                    }
                                }
                            })
                        };
                        await deleteAllFiles(mockReq, mockRes);

                        // Clear notes for the room from all clients in the room
                        io.to(room).emit('clear:notes');
                    } catch (error) {
                        console.error(`Error deleting files for room ${room}:`, error);
                    }
                }
                break;
            }
        }

        // Clean up maps
        const email = socketIdToEmailMap.get(socket.id);
        if (email) {
            emailtoSocketIdMap.delete(email);
            socketIdToEmailMap.delete(socket.id);
        }
    });
    socket.on("user:call", ({to, offer}) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer });
    });
    socket.on("call:accepted", ({to, answer}) => {
        io.to(to).emit("call:accepted", { from: socket.id, answer });
    });
    socket.on('peer:nego:needed', ({ to, offer }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    });
    socket.on('peer:nego:done', ({ to, answer }) => {
        io.to(to).emit('peer:nego:final', { from: socket.id, answer });
    });
    // New events for multi-user calling
    socket.on('room:call', ({ room, offer }) => {
        socket.to(room).emit('room:incoming:call', { from: socket.id, offer });
    });
    socket.on('room:call:accepted', ({ room, answer }) => {
        socket.to(room).emit('room:call:accepted', { from: socket.id, answer });
    });
    socket.on('room:peer:nego:needed', ({ room, offer }) => {
        socket.to(room).emit('room:peer:nego:needed', { from: socket.id, offer });
    });
    socket.on('room:peer:nego:done', ({ room, answer }) => {
        socket.to(room).emit('room:peer:nego:final', { from: socket.id, answer });
    });

    socket.on('send:message', ({ room, message }) => {
        const name = socket.user.name;
        socket.to(room).emit('receive:message', { name, message });
    });
});
