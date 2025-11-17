import pool from "../db.js";
import multer from "multer";
import fs from "fs";

// Multer storage for attachments (uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "backend/uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  }
});

export const upload = multer({ storage });

/** GET ALL PETITIONS */
export const getPetitions = async (req, res) => {
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
    res.status(500).json({ error: "Error fetching petitions" });
  }
};

/** CREATE PETITION (user submits) */
export const createPetition = async (req, res) => {
  try {
    const userId = req.user?.sub; // JWT user id
    const userEmail = req.user?.email; // JWT user email

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, address, phone, pincode, title, category, description } = req.body;
    const attachment = req.file ? `uploads/${req.file.filename}` : null;

    if (!name || !address || !phone || !pincode || !title || !category || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert full petition
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
        userEmail, 
        title,
        category,
        description,
        attachment
      ]
    );

    const newId = result.insertId;

    // Generate petition code (e.g., PET000123)
    const petitionCode = `PET${String(newId).padStart(6, "0")}`;

    // Update DB with generated code
    await pool.query(
      `UPDATE petitions SET petition_code = ? WHERE id = ?`,
      [petitionCode, newId]
    );

    // Fetch final petition
    const [latest] = await pool.query(
      "SELECT * FROM petitions WHERE id = ?",
      [newId]
    );

    res.status(201).json({
      message: "Petition submitted successfully",
      petition: latest[0],
    });
  } catch (err) {
    console.error("createPetition error:", err);
    res.status(500).json({ error: "Error creating petition" });
  }
};

/** UPDATE PETITION STATUS (admin only) */
export const updatePetitionStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const { id } = req.params; // id = petition_code

    await pool.query(
      `UPDATE petitions SET status = ?, remarks = ? WHERE petition_code = ?`,
      [status, remarks || null, id]
    );

    res.json({ message: "Petition status updated" });
  } catch (err) {
    console.error("updatePetitionStatus error:", err);
    res.status(500).json({ error: "Error updating petition" });
  }
};

/** TRACK PETITION BY petition_code + phone */
export const trackPetition = async (req, res) => {
  try {
    const { code, phone } = req.params;

    if (!code || !phone)
      return res.status(400).json({ error: "Petition code and phone are required" });

    const [rows] = await pool.query(
      "SELECT * FROM petitions WHERE petition_code = ? AND phone = ?",
      [code, phone]
    );

    if (!rows.length)
      return res.status(404).json({
        error: "No petition found for this Petition ID and phone number"
      });

    res.json(rows[0]);
  } catch (err) {
    console.error("trackPetition error:", err);
    res.status(500).json({ error: "Error tracking petition" });
  }
};