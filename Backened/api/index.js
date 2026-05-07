import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// 1. Config load karein
dotenv.config();

// 2. Routes Import
import authRoutes from "../routes/auth.js";
import salesRoutes from "../routes/sales.js";
import leadRoutes from "../routes/leadsroutes.js";
import activityRoutes from "../routes/activityroutes.js";
import targetRoutes from "../routes/targetRoutes.js";
import adminRoutes from "../routes/admin.js";
import projectRoutes from "../routes/projectRoutes.js";
import fileroutes from "../routes/fileroutes.js";

const app = express();

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Routes Registration
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileroutes);

// 5. Health Check & Base Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is healthy 🚀", timestamp: new Date() });
});

app.get("/api", (req, res) => {
  res.send("MT-CRM Backend is running on Vercel 🚀");
});

app.get("/", (req, res) => {
  res.send("Backend is live! Use /api for endpoints.");
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err.stack);
  res.status(500).json({ 
    message: "Something went wrong on the server!",
    error: process.env.NODE_ENV === "production" ? {} : err.message
  });
});



export default app;
