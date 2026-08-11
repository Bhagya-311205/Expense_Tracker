const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
require("dotenv").config({ path: envFile });

const express = require("express");
// const session = require("express-session");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

// const sessionSecret = process.env.SESSION_SECRET;

const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || FRONTEND_URL)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOriginHandler = (origin, callback) => {
  // Allow non-browser requests (no Origin header).
  if (!origin) return callback(null, true);

  const normalizedOrigin = origin.replace(/\/+$/, "");

  // If no origins are configured, allow all to avoid accidental lockout.
  if (ALLOWED_ORIGINS.length === 0) return callback(null, true);

  if (ALLOWED_ORIGINS.includes(normalizedOrigin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  const path = require("path");
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
  );
}

// app.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,
//       maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
//     },
//   })
// );

app.get("/", (req, res) => {
  res.send("Expense Tracker API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));