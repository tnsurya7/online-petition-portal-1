// backend/controllers/userController.js
import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_strong_secret";

// Register user (email + password)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    // check existing
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name || null, email, hashed]
    );

    const user = { id: result.insertId, email };
    const token = jwt.sign({ sub: user.id, email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token, user: { id: user.id, email } });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    const [rows] = await pool.query("SELECT id, password, name FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const userRow = rows[0];
    const match = await bcrypt.compare(password, userRow.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ sub: userRow.id, email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token, user: { id: userRow.id, email, name: userRow.name } });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Admin login (simple) - admin stored in DB with role 'admin' or you can create special check
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    const [rows] = await pool.query("SELECT id, password, name, role FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const userRow = rows[0];

    // only allow admin role
    if (!userRow.role || userRow.role !== "admin") {
      return res.status(403).json({ error: "Not authorized as admin" });
    }

    const match = await bcrypt.compare(password, userRow.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ sub: userRow.id, email, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: userRow.id, email, name: userRow.name, role: "admin" } });
  } catch (err) {
    console.error("loginAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Verify token endpoint (for frontend checks)
export const verifyToken = async (req, res) => {
  // The middleware will attach req.user if valid
  if (!req.user) return res.status(401).json({ ok: false });
  return res.json({ ok: true, user: req.user });
};