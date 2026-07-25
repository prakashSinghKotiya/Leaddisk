import { Router } from "express";
import {
  loginAdmin,
  getMe,
  logoutAdmin,
} from "../controller/authController.js";
import { protectAdmin } from "../middleware/authMw.js";

const router = Router();

router.post("/login", loginAdmin);
router.get("/me", protectAdmin, getMe);
router.post("/logout", protectAdmin, logoutAdmin);

export default router;
