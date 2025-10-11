import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoute.js';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/UserModel.js';

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
app.get('/', (req, res) => {
    res.send('API is running...');
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

const emailtoSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

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
        socket.join(room);
        socket.to(room).emit("room:joined", `User with ID: ${socket.id} joined the room`);
        emailtoSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(socket.id).emit("room:join", { email, room });
    });

    socket.on("disconnect", () => {
        console.log(`User with ID: ${socket.id} disconnected`);
    });
});
