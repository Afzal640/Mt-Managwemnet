import express from "express";
import { getSalesDashboard } from "../controller/salescontroller.js";
// ⚠️ File case sensitivity check karlein (authmiddleware vs authMiddleware)
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * 📊 SALES DASHBOARD
 * Sirf 'sales' role wale users access kar sakte hain
 */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("sales"),
  getSalesDashboard
);

export default router;