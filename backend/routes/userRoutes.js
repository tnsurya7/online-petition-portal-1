// backend/routes/userRoutes.js
import express from "express";
import { registerUser, loginUser, loginAdmin, verifyToken } from "../controllers/userController.js";
import { requireAuth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// public
router.post("/register", registerUser);
router.post("/login", loginUser);

// admin login
router.post("/admin/login", loginAdmin);
router.get("/admin/verify", adminAuth, verifyToken);

// token verify (for admin & user checks)
router.get("/verify", requireAuth, verifyToken);

export default router;