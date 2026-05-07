import express from "express";
import { upload } from "../middleware/uploadfile.js";
import { protect } from "../middleware/authMiddleware.js";
import { supabase } from "../config/supabaseClient.js";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";

const router = express.Router();

// 📌 UPLOAD FILE TO SUPABASE
router.post("/upload/:leadId", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    // 1. Supabase Storage (Bucket) mein file upload karein
    const fileUrl = await uploadToSupabase(req.file);

    // 2. Database ('files' table) mein record save karein
    const { data: newFile, error } = await supabase
      .from('files')
      .insert([{
        lead_id: req.params.leadId,
        name: req.file.originalname,
        url: fileUrl,
        size: (req.file.size / 1024 / 1024).toFixed(2) + " MB",
        uploaded_by: req.user?.name || "Admin"
      }])
      .select()
      .single();

    if (error) throw error;

    // Frontend compatibility ke liye _id add kar rahe hain
    res.json({ ...newFile, _id: newFile.id });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 📌 GET FILES BY LEAD
router.get("/:leadId", protect, async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('lead_id', req.params.leadId);

    if (error) throw error;

    // Har file ke saath _id attach karein taake frontend na tute
    const mappedFiles = files.map(f => ({ ...f, _id: f.id }));
    res.json(mappedFiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 DELETE FILE
router.delete("/:id", protect, async (req, res) => {
  try {
    // Note: Ye sirf database se record delete karega. 
    // Agar Storage bucket se bhi delete karna hai toh supabase.storage.from().remove() use hoga.
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;