import express from "express";
// ⚠️ File name check karlein (authmiddleware vs authMiddleware)
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { 
  getProjects, 
  handleProjectFileUpload // Agar aapne file upload wala function add kiya hai
} from "../controller/projectcontroller.js";
import { upload } from "../middleware/uploadfile.js";

const router = express.Router();

/**
 * 📁 GET ALL PROJECTS
 * Production aur Admin dono access kar sakte hain
 */
router.get(
  "/",
  protect,
  authorizeRoles("admin", "production"),
  getProjects
);

/**
 * 📤 UPLOAD PROJECT FILE (Optional - Agar functional banana hai)
 */
// router.post("/:id/upload", protect, upload.single("file"), handleProjectFileUpload);

export default router;