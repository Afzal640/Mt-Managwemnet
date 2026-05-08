import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// Routes Import
import authRoutes from "../routes/auth.js";
import salesRoutes from "../routes/sales.js";
import leadRoutes from "../routes/leadsroutes.js";
import activityRoutes from "../routes/activityroutes.js";
import targetRoutes from "../routes/targetRoutes.js";
import adminRoutes from "../routes/admin.js";
import projectRoutes from "../routes/projectRoutes.js";
import fileroutes from "../routes/fileroutes.js";

// FINAL CORS FIX - Ise aise hi rehne dein
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.endsWith(".vercel.app") || origin.includes("localhost"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }
  next();
});

app.use(express.json());

// Routes Registration
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileroutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is healthy 🚀" });
});

export default app;