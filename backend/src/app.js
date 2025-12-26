const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// core middleware
app.use(express.json());

// CORS - Allow both 3000 and 3001 for local dev
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3001", // Your actual frontend port
  "http://frontend:3000"   // For Docker
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// db
const { pool } = require("./config/db");

// routes
const authRoutes = require("./routes/authRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

// health endpoint
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({
      success: true,
      message: "System healthy",
      database: "connected"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      database: "disconnected"
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/tenants-test-ping", (req, res) => {
  res.json({ success: true, message: "Tenants test ping ok" });
});

// generic 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null
  });
});

module.exports = app;
