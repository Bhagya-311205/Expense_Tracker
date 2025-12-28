const jwt = require("jsonwebtoken");

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
require("dotenv").config({ path: envFile });

// Helper function to extract token from Authorization header or cookies
const extractToken = (req) => {
  // Try Authorization header first
  let token = req.headers.authorization?.split(" ")[1];
  
  // If not in Authorization header, try to get from cookies
  if (!token) {
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookie = cookies
        .split("; ")
        .find((cookie) => cookie.startsWith("token="));
      token = tokenCookie?.split("=")[1];
    }
  }
  
  return token;
};

const jwtAuthMiddleware = (req, res, next) => {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Optional JWT middleware - doesn't fail if token is missing
const optionalJwtAuth = (req, res, next) => {
  const token = extractToken(req);
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but continue anyway
    }
  }
  next();
};

const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "7d" });
};

module.exports = { jwtAuthMiddleware, optionalJwtAuth, generateToken, extractToken };
