import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { supabase } from "../config/supabaseClient.js";
import { 
  getLeads, 
  createLead, 
  updateLead, 
  deleteLead 
} from "../controller/leadscontroller.js";

const router = express.Router();

// ✅ GET ALL LEADS & CREATE LEAD
router.get("/", protect, getLeads);
router.post("/", protect, createLead);

/**
 * ✅ GET SINGLE LEAD BY ID (Supabase Version)
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Frontend compatibility ke liye _id add kar rahe hain
    res.json({ ...lead, _id: lead.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE & DELETE
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);

export default router;