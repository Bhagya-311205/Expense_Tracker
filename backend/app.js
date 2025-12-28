const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
require("dotenv").config({ path: envFile });

const express = require("express");
const path = require("path");
// const session = require("express-session");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

// const sessionSecret = process.env.SESSION_SECRET;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

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

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));