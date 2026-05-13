import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// ROUTES - Ensure these match your folder structure
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

// ==========================
// CORS: ALLOW EVERYTHING 🌍
// ==========================
app.use(cors({
  origin: (origin, callback) => {
    // Har origin ko allow kar dega (Dynamic Wildcard)
    callback(null, true);
  },
  credentials: true, // Auth headers allow karne ke liye
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

// OPTIONS requests (Pre-flight) ko handle karne ke liye
app.options("*", cors());

app.use(express.json());

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileroutes);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "CRM API Open & Running 🚀" });
});

export default app;