import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { protect } from "../middlewares/auth.js";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


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

// Validate token
export const validateToken = async (req, res) => {
    try {
        // The auth middleware will verify the token and set req.user
        // If we reach here, the token is valid
        res.status(200).json({
            message: "Token is valid",
            user: req.user
        });
    } catch (error) {
        console.error("Token validation error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Google Login
export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body || {};
        if (!idToken) {
            return res.status(400).json({ message: "ID Token is required" });
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;

        // Verify Google ID token cryptographically using google-auth-library
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: clientId,
        });
        const payload = ticket.getPayload();
        
        if (!payload) {
            return res.status(400).json({ message: "Invalid ID Token" });
        }

        const { email, sub: googleId, name, picture: avatar, email_verified } = payload;

        if (!email_verified) {
            return res.status(400).json({ message: "Google email is not verified" });
        }

        // Search for user by email
        let user = await User.findOne({ email });

        if (user) {
            // Link account if googleId is not already linked
            if (!user.googleId) {
                // Ensure no other account is using this googleId
                const existingGoogleUser = await User.findOne({ googleId });
                if (existingGoogleUser) {
                    return res.status(400).json({ message: "This Google account is already linked to another user." });
                }
                user.googleId = googleId;
                if (!user.avatar) {
                    user.avatar = avatar;
                }
                await user.save();
            } else if (user.googleId !== googleId) {
                return res.status(400).json({ message: "This email is associated with a different Google account." });
            }
        } else {
            // Ensure no user has this googleId
            const existingGoogleUser = await User.findOne({ googleId });
            if (existingGoogleUser) {
                return res.status(400).json({ message: "This Google account is already linked to another user." });
            }

            // Create new Google-only user
            // Generate a unique username from email
            const baseUserName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            let uniqueUserName = baseUserName;
            let count = 1;
            while (await User.findOne({ userName: uniqueUserName })) {
                uniqueUserName = `${baseUserName}${count}`;
                count++;
            }

            user = await User.create({
                name,
                userName: uniqueUserName,
                email,
                googleId,
                avatar,
            });
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
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error("Google Login verification error:", error);
        res.status(401).json({ message: "Invalid Google token or verification failed" });
    }
};

