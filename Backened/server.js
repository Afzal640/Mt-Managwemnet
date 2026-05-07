import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// 1. Config load karein
dotenv.config();

// 2. Database Connection (MongoDB wala ab zaroorat nahi hai)
// import connectDB from "./db/db.js"; <-- Isay remove ya comment kar dein
// connectDB(); <-- Isay bhi remove kar dein

// 3. Routes Import (Check karein ke paths sahi hain)
import authRoutes from "./routes/auth.js";
import salesRoutes from "./routes/sales.js";
// import productionRoutes from "./routes/production.js"; // Agar ye file hai toh theek, warna production logic projects mein hota hai
import leadRoutes from "./routes/leadsroutes.js";
import activityRoutes from "./routes/activityroutes.js";
import targetRoutes from "./routes/targetRoutes.js";
import adminRoutes from "./routes/admin.js";
import projectRoutes from "./routes/projectRoutes.js";
import fileroutes from "./routes/fileroutes.js";

const app = express();

// 4. Middleware
app.use(cors({
  origin: ["https://frontenedmt-crm-xiu9.vercel.app", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Explicitly handle preflight requests
app.options("*", cors());

app.use(express.json());

// 5. Routes Registration
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
// app.use("/api/production", productionRoutes); // Zarurat ke mutabiq
app.use("/api/activities", activityRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileroutes);

// 6. Base Route
app.get("/", (req, res) => {
  res.send("Backend is running on Supabase 🚀");
});

// 7. Server Start
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
}

export default app;