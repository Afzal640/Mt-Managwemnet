import express from "express";
import {
  assignTarget,
  getTargets,
  updateTargetProgress,
} from "../controller/targetcontroller.js";

// ⚠️ Check karein ke folder ka naam 'middleware' hai ya 'middlewares'
// Aur file ka naam 'authmiddleware.js' hai ya 'authMiddleware.js'
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🎯 TARGET ROUTES
router.post("/assign", protect, assignTarget);
router.get("/", protect, getTargets);
router.put("/update", protect, updateTargetProgress);

export default router;