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

// ✅ 1. ULTIMATE CORS CONFIGURATION
// Ye har request par headers bhejega taake browser block na kare
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow the current origin or fallback to wildcard
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle Preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// ✅ 2. ROUTES REGISTRATION
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileroutes);

// ✅ 3. HEALTH CHECK & BASE ROUTES
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
    timestamp: new Date().toISOString(),
    node_version: process.version
  });
});

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
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ 
    msg: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
  });
});

export default app;