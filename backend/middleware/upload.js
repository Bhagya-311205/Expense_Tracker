const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
