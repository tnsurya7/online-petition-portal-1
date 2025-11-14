import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

/** Generate JWT */
const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

/** REGISTER USER */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (exists.length)
      return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [name || null, email, phone || null, hashed]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role: "user",
    };

    const token = signToken(user);

    res.json({ token, user });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

/** USER LOGIN */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

/** ADMIN LOGIN */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND role = 'admin'",
      [email]
    );

    const admin = rows[0];

    if (!admin)
      return res.status(403).json({ error: "Admin account not found" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid admin password" });

    const token = signToken(admin);

    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("loginAdmin error:", err);
    res.status(500).json({ error: "Server error during admin login" });
  }
};

/** VERIFY TOKEN */
export const verifyToken = (req, res) => {
  if (!req.user) return res.status(401).json({ ok: false });
  return res.json({ ok: true, user: req.user });
};