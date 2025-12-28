const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
