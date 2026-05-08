import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// 1. Config load karein
dotenv.config();
const app = express();

// 2. Routes Import
import authRoutes from "../routes/auth.js";
import salesRoutes from "../routes/sales.js";
import leadRoutes from "../routes/leadsroutes.js";
import activityRoutes from "../routes/activityroutes.js";
import targetRoutes from "../routes/targetRoutes.js";
import adminRoutes from "../routes/admin.js";
import projectRoutes from "../routes/projectRoutes.js";
import fileroutes from "../routes/fileroutes.js";


app.use((req, res, next) => {
  const allowedOrigins = [
    "https://mt-managwemnet-rr4w.vercel.app",
    "http://localhost:5173"
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Sabse zaroori: OPTIONS request ko foran 200 OK dena
  if (req.method === "OPTIONS") {
    return res.status(200).json({}); 
  }
  next();
});

app.use(express.json());


// Request Logger for Vercel
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
  console.error("🔥 Global Error Handler:", err);
  
  // Ensure CORS headers on error (don't use * if credentials are used)
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  
  res.status(500).json({ 
    message: "Something went wrong on the server!",
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack
  });
});



export default app;
