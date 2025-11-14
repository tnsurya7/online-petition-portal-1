import express from "express";
import {
  getPetitions,
  createPetition,
  updatePetitionStatus,
  trackPetition,
  upload
} from "../controllers/petitionController.js";

import { requireAuth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

/** GET all petitions (admin dashboard + user view) */
router.get("/", getPetitions);

/** CREATE new petition (user only) */
router.post("/", requireAuth, upload.single("attachment"), createPetition);

/** UPDATE petition status (admin only) */
router.patch("/:id", adminAuth, updatePetitionStatus);

/** TRACK petition by petition_code */
/** TRACK petition by petition_code + phone number */
router.get("/track/:code/:phone", trackPetition);

export default router;