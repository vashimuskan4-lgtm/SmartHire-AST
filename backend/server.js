const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

// Database
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicantRoutes = require("./routes/applicantRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ===============================
// DATABASE
// ===============================

connectDB();

// ===============================
// CORS
// ===============================

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // (Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

// ===============================
// BODY PARSERS
// ===============================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===============================
// STATIC FILES
// ===============================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ===============================
// RATE LIMIT
// ===============================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartHire API is running",
  });
});

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  if (err.message && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ===============================
// START SERVER
// ===============================

// IMPORTANT FOR RENDER:
// Use Render's PORT, not a fixed port.

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SmartHire API running on port ${PORT}`);
});