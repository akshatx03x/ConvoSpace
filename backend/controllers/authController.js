import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate JWT and set it as a cookie
export const generateToken = (userId, res) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    // Set token as HttpOnly cookie
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
};

// Register a new user
export const register = async (req, res) => {
    try {
        const { name, userName, email, password } = req.body || {};

        if (!name || !userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            userName,
            email,
            password: hashedPassword,
        });

        // Generate JWT token and set as cookie
        let token;
        try {
            token = generateToken(newUser._id, res);
        } catch (err) {
            console.error("Token generation error:", err);
            return res.status(500).json({ message: "Token generation failed" });
        }

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                userName: newUser.userName,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        let token;
        try {
            token = generateToken(user._id, res);
        } catch (err) {
            console.error("Token generation error:", err);
            return res.status(500).json({ message: "Token generation failed" });
        }

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                userName: user.userName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
