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

// ✅ ENHANCED CORS CONFIGURATION
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost and any vercel.app domain
    if (origin.includes("localhost") || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11) choke on 204
}));

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

app.get("/favicon.ico", (req, res) => res.status(204).end());

// ✅ CATCH-ALL 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    msg: "Endpoint not found",
    path: req.originalUrl,
    method: req.method
  });
});

// ✅ GLOBAL ERROR HANDLER (Ensures CORS headers are present even on crashes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    msg: "Internal Server Error", 
    error: err.message 
  });
});

export default app;