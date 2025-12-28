const crypto = require("crypto");
const User = require("../models/User");
const { transporter } = require("../config/email");
const { generateToken } = require("../middleware/jwtAuthMiddleware");

const OTP_EXPIRY_MS = 60 * 1000;

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
});

const sendOtpEmail = async (email, otp, label = "OTP Verification") => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `TrackEx: ${label}`,
    text: `<h1>Greetings from TrackEx. Your OTP is ${otp}</h1>`,
  });
};

exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        existingUser.name = name;
        existingUser.password = password;

        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

        await existingUser.save();
        await sendOtpEmail(email, otp, "OTP Verification for Creating Account");

        return res.status(200).json({
          message: "Details updated. Please verify OTP sent to email.",
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

    await sendOtpEmail(email, otp, "OTP Verification for Creating Account");

    res
      .status(201)
      .json({ message: "User registered. Please verify OTP sent to email." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
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

    // Session-based authentication (commented out for JWT)
    // req.session.user = formatUser(user);

    // JWT-based authentication with httpOnly cookie
    const token = generateToken(formatUser(user));
    res
      .cookie("token", token, {
        httpOnly: true,        // JavaScript can't access it (XSS protection)
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict",    // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({ message: "Login successful", user: formatUser(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    await sendOtpEmail(email, otp, "OTP Verification");
    res.json({ message: "OTP resent successfully. Please check your email." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resending OTP", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found. Please Sign Up." });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Session-based check (commented out for JWT)
    // if (req.session?.user?.id === user._id.toString()) {
    //   return res.json({
    //     message: "Already logged in",
    //     user: formatUser(user),
    //     requiresOTP: false,
    //   });
    // }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    await sendOtpEmail(email, otp, "Login OTP Verification");
    res.json({
      message: "OTP sent to your email. Please verify to login.",
      requiresOTP: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

exports.logout = (req, res) => {
  // Session-based logout (commented out for JWT)
  // req.session.destroy((err) => {
  //   if (err) {
  //     return res
  //       .status(500)
  //       .json({ message: "Error logging out", error: err.message });
  //   }
  //   res.json({ message: "Logout successful" });
  // });

  // JWT-based logout with httpOnly cookie (server clears token)
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({ message: "Logout successful" });
};

exports.getCurrentUser = (req, res) => {
  // Session-based (commented out for JWT)
  // const currentUser = req.session?.user;
  // if (!currentUser) {
  //   return res.status(200).json({ user: null });
  // }
  // res.json({ user: currentUser });

  // JWT-based - user is attached by middleware
  const currentUser = req.user;
  if (!currentUser) {
    return res.status(200).json({ user: null });
  }

  res.json({ user: currentUser });
};
