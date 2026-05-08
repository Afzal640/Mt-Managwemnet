import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes Import
import authRoutes from "../routes/auth.js";
import salesRoutes from "../routes/sales.js";
import leadRoutes from "../routes/leadsroutes.js";
import activityRoutes from "../routes/activityroutes.js";
import targetRoutes from "../routes/targetRoutes.js";
import adminRoutes from "../routes/admin.js";
import projectRoutes from "../routes/projectRoutes.js";
import fileroutes from "../routes/fileroutes.js";

dotenv.config();
const app = express();

// ✅ 1. CORS Configuration (Proper Way)
app.use(cors({
  origin: "*", // Production mein isko "https://mt-managwemnet-rr4w.vercel.app" kar dein
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

// ✅ 2. Body Parser
app.use(express.json());

// ✅ 3. Routes Registration
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileroutes);

// Root Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "CRM API is running... 🚀",
    docs: "Please use /api/health to check status"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Backend is healthy 🚀",
    timestamp: new Date().toISOString()
  });
});

// Favicon issues fix
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ✅ 4. CATCH-ALL 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    msg: "Endpoint not found",
    path: req.originalUrl,
    method: req.method
  });
});

// ✅ 5. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ 
    msg: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
  });
});

// Vercel ke liye export
export default app;