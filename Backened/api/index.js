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
const allowedOrigins = [
  "https://frontenedmt-crm-xiu9.vercel.app",
  "https://mt-crm-pi.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      // In development/initial setup, we can be more lenient if needed, 
      // but reflecting the origin is usually better.
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "Accept", 
    "Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

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
