require("dotenv").config();

require("express-async-errors");

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicantRoutes = require("./routes/applicantRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();


// ===============================
// Connect to MongoDB
// ===============================

connectDB();


// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true }));


// ===============================
// Static Files
// ===============================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


// ===============================
// Rate Limiting
// ===============================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

app.use("/api", limiter);


// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "SmartHire API is running",
  });
});


// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/applicants", applicantRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/users", userRoutes);


// ===============================
// Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "A record with this value already exists.",
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
});


// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SmartHire API running on port ${PORT}`);
});