import { Router } from "express";
import {
  getAllUsers,
  getUser,
  userSubmission,
  updateUserStatus,
  searchUsers,
} from "../controller/userController.js";
import { protectAdmin } from "../middleware/authMw.js";

const router = Router();

// Public route - lead submission
router.post("/submit", userSubmission);

// Protected admin routes
router.get("/admin", protectAdmin, getAllUsers);
router.get("/admin/search", protectAdmin, searchUsers);
router.get("/admin/:id", protectAdmin, getUser);
router.patch("/admin/:id/status", protectAdmin, updateUserStatus);

export default router;
