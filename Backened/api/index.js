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


// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://mt-managwemnet-pudb.vercel.app"
];


// ✅ CORS CONFIG
app.use(cors({
  origin: function (origin, callback) {

    // allow requests with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed"));
    }
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept"
  ],

  credentials: true
}));


// ✅ HANDLE PREFLIGHT
app.options("*", cors());


// ✅ BODY PARSER
app.use(express.json());


// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileroutes);


// ✅ ROOT
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CRM API Running 🚀"
  });
});


// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString()
  });
});


// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});


// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {

  console.error("🔥 ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


export default app;