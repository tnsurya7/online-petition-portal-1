import express from "express";
import { getPetitions, createPetition, upload } from "../controllers/petitionController.js";
import db from "../db.js";

const router = express.Router();

// Fetch petitions
router.get("/", getPetitions);

// Create new petition
router.post("/", upload.single("file"), createPetition);

// ✅ Update petition status and remarks
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE petitions SET status = ?, remarks = ? WHERE id = ? OR petition_id = ?",
      [status, remarks || null, id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Petition not found" });
    }

    res.json({ message: "Petition updated successfully" });
  } catch (error) {
    console.error("Error updating petition:", error);
    res.status(500).json({ message: "Database error" });
  }
});

export default router;