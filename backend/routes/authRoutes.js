const express = require("express");
const {
  signUp,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authmiddleware");
const { optionalJwtAuth } = require("../middleware/jwtAuthMiddleware");

const router = express.Router();

router.post("/signup", signUp);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/current-user", optionalJwtAuth, getCurrentUser);

module.exports = router;