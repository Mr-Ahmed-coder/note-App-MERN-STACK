import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/Auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  console.log("=== REGISTER REQUEST STARTED ===");
  console.log("Request body:", req.body);
  
  const { username, email, password } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      console.log("Validation failed: Missing fields");
      return res.status(400).json({ message: "cilad gudaha" });
    }

    console.log("Checking if user exists...");
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Creating new user...");
    const user = await User.create({ username, email, password });
    console.log("User created successfully:", user._id);
    
    console.log("Generating token...");
    const token = generateToken(user._id);
    console.log("Token generated successfully");

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
    
    console.log("=== REGISTER REQUEST COMPLETED ===");

  } catch (err) {
    console.error("=== REGISTER ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("=== LOGIN REQUEST STARTED ===");
  console.log("Request body:", req.body);
  
  const { email, password } = req.body;

  try {
    console.log("Finding user...");
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("User found, checking password...");
    const isPasswordMatch = await user.matchPassword(password);
    
    if (!isPasswordMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("Password matched, generating token...");
    const token = generateToken(user._id);
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
    
    console.log("=== LOGIN REQUEST COMPLETED ===");
    
  } catch (err) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Me
router.get("/me", protect, async (req, res) => {
  console.log("=== ME REQUEST ===");
  console.log("User:", req.user);
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables!");
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default router;