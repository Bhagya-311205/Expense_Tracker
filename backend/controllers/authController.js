const crypto = require("crypto");
const User = require("../models/User");
const { transporter } = require("../config/email");
const { generateToken } = require("../middleware/jwtAuthMiddleware");

const OTP_EXPIRY_MS = 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
});

// TEMPORARY: Skip email sending entirely for testing
const sendOtpEmail = async (email, otp, label = "OTP Verification") => {
  try {
    console.log(`📧 [TEMP] Skipping email send to ${email}`);
    console.log(`📧 [TEMP] OTP for testing: ${otp}`);
    // Don't actually send email — just log it
    // This lets you test signup/login flow without email setup
  } catch (error) {
    console.error("Error in sendOtpEmail:", error.message);
  }
};

exports.signUp = async (req, res) => {
  try {
    console.log("📝 signUp request received for:", req.body.email);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, password" 
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        existingUser.name = name;
        existingUser.password = password;

        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

        await existingUser.save();
        
        sendOtpEmail(email, otp, "OTP Verification for Creating Account").catch(err =>
          console.error("Email send failed:", err.message)
        );

        return res.status(200).json({
          message: "Details updated. Please verify OTP sent to email.",
          otp: otp // TEMPORARY: Return OTP for testing (remove in production)
        });
      }
      return res.status(409).json({
        message: "User already exists. Please sign in.",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    const user = new User({ name, email, password, otp, otpExpiry });

    await user.save();

    sendOtpEmail(email, otp, "OTP Verification for Creating Account").catch(err =>
      console.error("Email send failed:", err.message)
    );

    console.log(`✅ User registered: ${email}, OTP: ${otp}`);
    
    res.status(201).json({ 
      message: "User registered. Please verify OTP sent to email.",
      otp: otp // TEMPORARY: Return OTP for testing (remove in production)
    });
  } catch (error) {
    console.error("❌ signUp error:", error.message);
    res.status(500).json({ 
      message: "Error registering user", 
      error: error.message 
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    console.log("🔐 verifyOTP request received");
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: "Missing required fields: email, otp" 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    console.log(`Verifying OTP for ${email}: received=${otp}, stored=${user.otp}`);
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (!user.isVerified) {
      user.isVerified = true;
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(formatUser(user));
    console.log(`✅ OTP verified for ${email}`);
    
    res
      .cookie("token", token, authCookieOptions)
      .json({ 
        message: "Login successful", 
        user: formatUser(user) 
      });
  } catch (error) {
    console.error("❌ verifyOTP error:", error.message);
    res.status(500).json({ 
      message: "Error verifying OTP", 
      error: error.message 
    });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    console.log("🔄 resendOTP request received");
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Missing required field: email" 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    sendOtpEmail(email, otp, "OTP Verification").catch(err =>
      console.error("Email send failed:", err.message)
    );

    console.log(`✅ OTP resent for ${email}, OTP: ${otp}`);

    res.json({ 
      message: "OTP resent successfully. Please check your email.",
      otp: otp // TEMPORARY: Return OTP for testing (remove in production)
    });
  } catch (error) {
    console.error("❌ resendOTP error:", error.message);
    res.status(500).json({ 
      message: "Error resending OTP", 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("🔑 login request received for:", req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields: email, password" 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ 
        message: "User not found. Please Sign Up." 
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    console.log(`📧 Login OTP for ${email}: ${otp}`);
    
    sendOtpEmail(email, otp, "Login OTP Verification").catch(err =>
      console.error("Email send failed:", err.message)
    );

    res.json({
      message: "OTP sent to your email. Please verify to login.",
      requiresOTP: true,
      otp: otp // TEMPORARY: Return OTP for testing (remove in production)
    });
  } catch (error) {
    console.error("❌ login error:", error.message);
    res.status(500).json({ 
      message: "Error logging in", 
      error: error.message 
    });
  }
};

exports.logout = (req, res) => {
  console.log("👋 logout request received");
  
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "strict",
    })
    .json({ message: "Logout successful" });
};

exports.getCurrentUser = (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    return res.status(200).json({ user: null });
  }

  res.json({ user: currentUser });
};