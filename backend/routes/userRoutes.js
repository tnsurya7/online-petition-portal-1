// backend/routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
  verifyToken
} from "../controllers/userController.js";

import { requireAuth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

/* -----------------------------------
   PUBLIC ROUTES
----------------------------------- */
router.post("/register", registerUser);
router.post("/login", loginUser);

/* -----------------------------------
   ADMIN ROUTES
----------------------------------- */
router.post("/admin/login", loginAdmin);

// verify admin token
router.get("/admin/verify", adminAuth, verifyToken);

/* -----------------------------------
   USER TOKEN VERIFY
----------------------------------- */
router.get("/verify", requireAuth, verifyToken);

export default router;