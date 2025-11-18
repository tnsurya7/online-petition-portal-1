import express from "express";
import multer from "multer";
import fs from "fs";
import pool from "../db.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

/* --------------------------------------------------------
   🗂 FILE UPLOAD
-------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "backend/uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

/* --------------------------------------------------------
   1️⃣ GET ALL PETITIONS
-------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS user_name, u.email AS user_email 
       FROM petitions p 
       LEFT JOIN users u ON p.user_id = u.id 
       ORDER BY p.id DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("getPetitions error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* --------------------------------------------------------
   2️⃣ CREATE PETITION (EMAIL OPTIONAL)
-------------------------------------------------------- */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      pincode,
      email, // optional
      title,
      category,
      description
    } = req.body;

    const attachment = req.file ? `uploads/${req.file.filename}` : null;

    // Validate WITHOUT email
    if (!name || !address || !phone || !pincode || !title || !category || !description) {
      return res.status(400).json({ error: "All fields except email are required" });
    }

    // If email provided → link or create user
    let userId = null;

    if (email) {
      const [user] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

      if (user.length > 0) {
        userId = user[0].id;
      } else {
        const [newUser] = await pool.query(
          `INSERT INTO users (name, email, phone) VALUES (?, ?, ?)`,
          [name, email, phone]
        );
        userId = newUser.insertId;
      }
    }

    // Insert petition (email optional)
    const [result] = await pool.query(
      `INSERT INTO petitions
       (user_id, name, address, phone, pincode, email, title, category, description, attachment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        address,
        phone,
        pincode,
        email || null,
        title,
        category,
        description,
        attachment
      ]
    );

    const newId = result.insertId;
    const petitionCode = `PET${String(newId).padStart(6, "0")}`;

    // Save petition code
    await pool.query("UPDATE petitions SET petition_code = ? WHERE id = ?", [
      petitionCode,
      newId
    ]);

    res.json({
      message: "Petition created successfully",
      petition_code: petitionCode
    });
  } catch (err) {
    console.error("createPetition error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* --------------------------------------------------------
   3️⃣ UPDATE PETITION STATUS (ADMIN)
-------------------------------------------------------- */
router.patch("/:code", verifyAdminToken, async (req, res) => {
  const { code } = req.params;
  const { status, remarks } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE petitions SET status = ?, remarks = ? WHERE petition_code = ?`,
      [status, remarks, code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Petition not found" });
    }

    res.json({ message: "Petition updated successfully" });
  } catch (err) {
    console.error("updatePetition error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* --------------------------------------------------------
   4️⃣ DELETE PETITION (ADMIN)
-------------------------------------------------------- */
router.delete("/:code", verifyAdminToken, async (req, res) => {
  const { code } = req.params;

  try {
    // Find attachment
    const [rows] = await pool.query(
      "SELECT attachment FROM petitions WHERE petition_code = ?",
      [code]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Petition not found" });

    const file = rows[0].attachment;

    // Delete file
    if (file && fs.existsSync(`backend/${file}`)) {
      fs.unlinkSync(`backend/${file}`);
    }

    // Delete petition
    await pool.query("DELETE FROM petitions WHERE petition_code = ?", [code]);

    res.json({ message: "Petition deleted successfully" });
  } catch (err) {
    console.error("deletePetition error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* --------------------------------------------------------
   5️⃣ TRACK PETITION (BY ID OR PHONE)
-------------------------------------------------------- */
router.get("/track", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM petitions
       WHERE petition_code = ? OR phone = ?
       LIMIT 1`,
      [query, query]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No petition found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("track error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;