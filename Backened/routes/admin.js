import express from "express";
import { supabase } from "../config/supabaseClient.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getTeamReport, getChartData } from "../controller/admincontroller.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * 🟢 USERS LIST
 */
router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, status');

    if (error) throw error;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * 🟡 DASHBOARD STATS
 */
router.get("/dashboard-stats", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    // 1. Users fetch karein roles ke liye (optional count)
    const { data: users, error: userError } = await supabase.from('users').select('role');
    
    // 2. Leads fetch karein stats ke liye
    const { data: leads, error: leadError } = await supabase.from('leads').select('status, budget');

    // 3. Activities fetch karein
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*, createdBy:users(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (userError || leadError || actError) throw userError || leadError || actError;

    const wonLeads = leads.filter(l => l.status === "closed-won");
    const followupLeads = leads.filter(l => l.status === "discussing" || l.status === "proposal");

    const totalRevenue = wonLeads.reduce((sum, l) => sum + (parseFloat(l.budget) || 0), 0);

    res.json({
      leads: { value: leads.length, change: 10, trend: "up" },
      deals: { value: wonLeads.length, change: 5, trend: "up" },
      followups: { value: followupLeads.length, change: -2, trend: "down" },
      revenue: { value: totalRevenue, change: 12, trend: "up" },
      recentActivities: activities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * 📊 CHART DATA
 */
router.get("/chart-data", protect, authorizeRoles("admin", "sales", "production"), getChartData);

/**
 * 👥 TEAM REPORT
 */
router.get("/team-report", protect, authorizeRoles("admin", "sales", "production"), getTeamReport);



/**
 * 🔵 CREATE USER
 */
router.post("/create-user", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;