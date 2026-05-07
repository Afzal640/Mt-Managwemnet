import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProjectStatus,
  addProjectFile,
  createProjectFromLead,
  handleProjectFileUpload // Naya Supabase file handler
} from "../controller/projectcontroller.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadfile.js";

const router = express.Router();

// --- ROUTES ---

// 1. ✅ CONVERT LEAD TO PROJECT (Admin Only)
router.post("/from-lead", protect, authorizeRoles("admin"), createProjectFromLead);

// 2. ✅ GET ALL PROJECTS (Filtered for Admin/Production)
router.get("/", protect, authorizeRoles("admin", "production"), getProjects);

// 3. ✅ CREATE PROJECT (Admin Only)
router.post("/", protect, authorizeRoles("admin"), createProject);

// 4. ✅ GET SINGLE PROJECT
router.get("/:id", protect, getProjectById);

// 5. ✅ UPDATE STATUS (Admin/Production)
router.patch("/:id/status", protect, authorizeRoles("admin", "production"), updateProjectStatus);

// 6. ✅ UPLOAD PROJECT FILE (Using Supabase Storage)
// Ye route aapki file upload utility use karega
router.post("/:id/upload", protect, upload.single("file"), handleProjectFileUpload);

// 7. ✅ ADD PROJECT FILE RECORD (Database only)
router.post("/:id/files", protect, authorizeRoles("admin", "production"), addProjectFile);

export default router;