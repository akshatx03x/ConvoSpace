// server.js (fixed)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoute.js';
import fileRoutes from './routes/fileRoute.js';
import geminiRoutes from './routes/geminiRoute.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/UserModel.js';
import { deleteAllFiles } from './controllers/fileController.js';

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://convospace-mu.vercel.app"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("MongoDB connected");
  } catch (error) {
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
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Make io accessible in routes if needed
app.set('io', io);

const emailtoSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const roomUsers = new Map(); // Track users per room
const activeRooms = new Set(); // Track active rooms/meetings

io.on("connection", async (socket) => {
  console.log('Socket connected:', socket.id);

  const token = socket.handshake.auth?.token;
  if (!token) {
    console.warn('No token provided — disconnecting socket:', socket.id);
    socket.disconnect();
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.warn('Invalid user in token — disconnecting:', socket.id);
      socket.disconnect();
      return;
    }
    socket.user = user;
  } catch (err) {
    console.warn('Token verify failed — disconnecting:', socket.id, err.message);
    socket.disconnect();
    return;
  }

  socket.on("room:join", (data) => {
    const { room } = data;
    const email = socket.user.email;

    // Check if already in room (by email)
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

    // New room -> mark active
    if (!roomUsers.has(room)) {
      activeRooms.add(room);
    } else if (!activeRooms.has(room)) {
      io.to(socket.id).emit("room:join:error", { message: "No active meeting found for this room code. Please create a new room or wait for the meeting to start." });
      return;
    }

    socket.join(room);
    emailtoSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    if (!roomUsers.has(room)) {
      roomUsers.set(room, new Set());
    }
    roomUsers.get(room).add(socket.id);

    // Notify existing users about the new user (broadcast to room)
    socket.to(room).emit("user:join", { email, id: socket.id });

    // Send existing users to the new user
    const existingUsers = roomUsers.get(room);
    for (const userId of existingUsers) {
      if (userId !== socket.id) {
        const userEmail = socketIdToEmailMap.get(userId);
        io.to(socket.id).emit("user:join", { email: userEmail, id: userId });
      }
    }

    io.to(socket.id).emit("room:join", { email, room });
    console.log(`User ${email} (${socket.id}) joined room ${room}`);
  });

  socket.on("disconnect", async () => {
    console.log(`User with ID: ${socket.id} disconnected`);
    // Remove user from room tracking
    for (const [room, users] of roomUsers.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(room).emit('user:left', { id: socket.id });
        console.log(`Notified room ${room} that socket ${socket.id} left`);
        if (users.size === 0) {
          roomUsers.delete(room);
          activeRooms.delete(room);
          try {
            const mockReq = {
              query: { room },
              app: app
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
            io.to(room).emit('clear:notes');
          } catch (error) {
            console.error(`Error deleting files for room ${room}:`, error);
          }
        }
        break;
      }
    }

    const email = socketIdToEmailMap.get(socket.id);
    if (email) {
      emailtoSocketIdMap.delete(email);
      socketIdToEmailMap.delete(socket.id);
    }
  });

  // Legacy one-to-one handlers (kept for compatibility if used elsewhere)
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });
  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id, answer });
  });
  socket.on('peer:nego:needed', ({ to, offer }) => {
    io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
  });
  socket.on('peer:nego:done', ({ to, answer }) => {
    io.to(to).emit('peer:nego:final', { from: socket.id, answer });
  });

  // Multi-user/room handlers
  socket.on('room:call', ({ room, offer }) => {
    socket.to(room).emit('room:incoming:call', { from: socket.id, offer });
    console.log(`Relayed room:call from ${socket.id} to room ${room}`);
  });

  socket.on('room:call:accepted', ({ room, answer }) => {
    socket.to(room).emit('room:call:accepted', { from: socket.id, answer });
    console.log(`Relayed room:call:accepted from ${socket.id} to room ${room}`);
  });

  socket.on('room:peer:nego:needed', ({ room, offer }) => {
    socket.to(room).emit('room:peer:nego:needed', { from: socket.id, offer });
    console.log(`Relayed room:peer:nego:needed from ${socket.id} to room ${room}`);
  });

  socket.on('room:peer:nego:done', ({ room, answer }) => {
    socket.to(room).emit('room:peer:nego:final', { from: socket.id, answer });
    console.log(`Relayed room:peer:nego:done from ${socket.id} to room ${room}`);
  });

  // <-- FIX: relay ICE candidates for room flow (per-target or broadcast)
  socket.on('room:ice:candidate', ({ room, candidate, to }) => {
    try {
      if (!candidate) return;
      if (to) {
        io.to(to).emit('room:ice:candidate', { candidate, from: socket.id });
        console.log(`Relayed ICE candidate from ${socket.id} -> ${to}`);
      } else if (room) {
        socket.to(room).emit('room:ice:candidate', { candidate, from: socket.id });
        console.log(`Relayed ICE candidate from ${socket.id} -> room ${room}`);
      } else {
        console.warn('room:ice:candidate received without "to" or "room":', socket.id);
      }
    } catch (err) {
      console.error('Error relaying ICE candidate:', err);
    }
  });

  // Chat message forwarding in a room
  socket.on('send:message', ({ room, message }) => {
    const name = socket.user.name;
    socket.to(room).emit('receive:message', { name, message });
  });
});
