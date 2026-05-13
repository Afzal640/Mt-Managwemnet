import express from "express";

import dotenv from "dotenv";

import cors from "cors";



// ROUTES

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

// CORS FIX (FINAL WORKING)

// ==========================



const allowedOrigins = [

  "http://localhost:5173",

  "http://localhost:3000",

  "https://mt-managwemnet-pudb.vercel.app",

  "https://mt-managwemnet.vercel.app"

];



const corsOptions = {

  origin: (origin, callback) => {



    // POSTMAN / Mobile Apps / Server Requests

    if (!origin) {

      return callback(null, true);

    }



    if (allowedOrigins.includes(origin)) {

      return callback(null, true);

    }



    console.log("❌ BLOCKED ORIGIN:", origin);



    return callback(null, true);



    // Agar strict security chahiye toh ye use karo:

    // return callback(new Error("Not allowed by CORS"));

  },



  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],



  allowedHeaders: [

    "Origin",

    "X-Requested-With",

    "Content-Type",

    "Accept",

    "Authorization"

  ],



  credentials: true,



  optionsSuccessStatus: 200

};





// IMPORTANT

app.use(cors(corsOptions));





// PRE-FLIGHT FIX

app.options("*", cors(corsOptions));





// MANUAL HEADERS BACKUP

app.use((req, res, next) => {



  const origin = req.headers.origin;



  if (allowedOrigins.includes(origin)) {

    res.header("Access-Control-Allow-Origin", origin);

  }



  res.header(

    "Access-Control-Allow-Headers",

    "Origin, X-Requested-With, Content-Type, Accept, Authorization"

  );



  res.header(

    "Access-Control-Allow-Methods",

    "GET, POST, PUT, PATCH, DELETE, OPTIONS"

  );



  res.header(

    "Access-Control-Allow-Credentials",

    "true"

  );



  // HANDLE OPTIONS

  if (req.method === "OPTIONS") {

    return res.sendStatus(200);

  }



  next();

});





// ==========================

// BODY PARSER

// ==========================



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





// ==========================

// ROOT

// ==========================



app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message: "CRM API Running 🚀"

  });

});





// ==========================

// HEALTH CHECK

// ==========================



app.get("/api/health", (req, res) => {

  res.status(200).json({

    success: true,

    status: "OK",

    timestamp: new Date().toISOString()

  });

});





// ==========================

// 404

// ==========================



app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route Not Found",

    path: req.originalUrl

  });

});





// ==========================

// ERROR HANDLER

// ==========================



app.use((err, req, res, next) => {



  console.error("🔥 SERVER ERROR:", err);



  res.status(500).json({

    success: false,

    message: err.message || "Internal Server Error"

  });

});





export default app;