import express from "express";
// ⚠️ Check karein ke file ka naam 'authMiddleware.js' hai ya 'authmiddleware.js'
import { protect } from "../middleware/authMiddleware.js";
import {
  getActivities,
  createActivity
} from "../controller/activitycontroller.js";

const router = express.Router();

// Dono routes ab humare naye Supabase controllers use karenge
router.get("/", protect, getActivities);
router.post("/", protect, createActivity);

export default router;