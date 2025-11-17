import express from "express";
import multer from "multer";
import fs from "fs";
import pool from "../db.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* --------------------------------------------------------
   🗂 FILE UPLOAD: backend/uploads/
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
    const fname = `${Date.now()}-${file.originalname}`;
    cb(null, fname);
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
   2️⃣ CREATE PETITION (User Form)
-------------------------------------------------------- */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      pincode,
      email,
      title,
      category,
      description
    } = req.body;

    const attachment = req.file ? `uploads/${req.file.filename}` : null;

    // Validate
    if (!name || !address || !phone || !pincode || !email || !title || !category || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    let userId;
    const [user] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email
    ]);

    if (user.length > 0) {
      userId = user[0].id;
    } else {
      const [newUser] = await pool.query(
        `INSERT INTO users (name, email, phone) VALUES (?, ?, ?)`,
        [name, email, phone]
      );
      userId = newUser.insertId;
    }

    // Insert petition
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
        email,
        title,
        category,
        description,
        attachment
      ]
    );

    const newId = result.insertId;
    const petitionCode = `PET${String(newId).padStart(6, "0")}`;

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
   3️⃣ UPDATE PETITION STATUS (Admin)
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
   4️⃣ DELETE PETITION (Admin)
-------------------------------------------------------- */
router.delete("/:code", verifyAdminToken, async (req, res) => {
  const { code } = req.params;

  try {
    // Find attachment first
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

    // Delete row
    await pool.query(
      "DELETE FROM petitions WHERE petition_code = ?",
      [code]
    );

    res.json({ message: "Petition deleted successfully" });
  } catch (err) {
    console.error("deletePetition error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* --------------------------------------------------------
   5️⃣ TRACK PETITION (ID + Phone)
-------------------------------------------------------- */
router.get("/track/search", async (req, res) => {
  const { id, phone } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM petitions 
       WHERE petition_code = ? AND phone = ?`,
      [id, phone]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "No petition found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("track error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;