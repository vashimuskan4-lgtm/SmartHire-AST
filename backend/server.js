const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");

dotenv.config();

const connectDB = require("./config/db");

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

const clientUrl = process.env.CLIENT_URL || "";

// Parse and normalize origins (remove trailing slashes, trim whitespace)
const parsedOrigins = clientUrl
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// Default development origins
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

const allowedOrigins = Array.from(new Set([...parsedOrigins, ...defaultOrigins]));

console.log("Allowed CORS origins:", allowedOrigins);
if (!clientUrl) {
  console.warn("Notice: CLIENT_URL environment variable is not set. Defaulting to localhost origins. Set CLIENT_URL to your Vercel frontend URL in production.");
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without Origin (e.g. mobile apps, curl, server-to-server, Postman)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/+$/, "");

    // 1. Direct match or wildcard '*'
    if (allowedOrigins.includes("*") || allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // 2. Allow any .vercel.app domain if vercel.app or *.vercel.app is specified in allowedOrigins
    const isVercelDomain =
      cleanOrigin.endsWith(".vercel.app") &&
      allowedOrigins.some(
        (allowed) =>
          allowed.includes("vercel.app") ||
          allowed === "*.vercel.app" ||
          allowed === "*"
      );

    if (isVercelDomain) {
      return callback(null, true);
    }

    // 3. Custom wildcard matching (e.g. https://*.mydomain.com)
    const matchesWildcard = allowedOrigins.some((allowed) => {
      if (allowed.startsWith("https://*.")) {
        const domainSuffix = allowed.slice("https://*.".length);
        return cleanOrigin.startsWith("https://") && cleanOrigin.endsWith(`.${domainSuffix}`);
      }
      if (allowed.startsWith("http://*.")) {
        const domainSuffix = allowed.slice("http://*.".length);
        return cleanOrigin.startsWith("http://") && cleanOrigin.endsWith(`.${domainSuffix}`);
      }
      return false;
    });

    if (matchesWildcard) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(new Error("CORS blocked"));
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests with identical options
app.options("*", cors(corsOptions));

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
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartHire API root is online",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
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

  if (err.message === "CORS blocked") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked: Origin not allowed",
      origin: req.headers.origin || null,
      hint: "Make sure CLIENT_URL environment variable on Render includes your Vercel URL: " + (req.headers.origin || ""),
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SmartHire API running on port ${PORT}`);
});