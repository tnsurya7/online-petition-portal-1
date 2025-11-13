import pool from "../db.js";
import path from "path";
import multer from "multer";
import fs from "fs";

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "backend/uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// GET /api/petitions
export const getPetitions = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM petitions ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching petitions:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/petitions
export const createPetition = async (req, res) => {
  const { name, phone, email, category, description, status } = req.body;
  const filePath = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const petitionId = `PET${Math.floor(100000 + Math.random() * 900000)}`;
    const [result] = await pool.query(
      `INSERT INTO petitions (petition_id, date, name, phone, email, category, description, status, file_path)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)`,
      [petitionId, name, phone, email, category, description, status || "Pending", filePath]
    );

    res.status(201).json({
      id: result.insertId,
      petition_id: petitionId,
      name,
      phone,
      email,
      category,
      description,
      status: status || "Pending",
      file_path: filePath,
      message: "Petition created successfully",
    });
  } catch (err) {
    console.error("Error creating petition:", err);
    res.status(500).json({ error: err.message });
  }
};