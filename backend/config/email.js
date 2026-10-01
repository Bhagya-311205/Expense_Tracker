// ============================================================
// OLD METHOD — Gmail SMTP with Nodemailer
// Kept here for reference / fallback
// ============================================================

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
//   },
// });

// module.exports = { transporter };


// ============================================================
// NEW METHOD — Gmail API
// ============================================================

const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

const createRawMessage = ({
  from,
  to,
  subject,
  html,
}) => {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  return Buffer.from(message, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendOtpEmail = async (
  email,
  otp,
  label = "OTP Verification"
) => {
  const html = `
    <div>
      <p>
        Your One-Time Password (OTP) is:
        <b>${otp}</b>
      </p>

      <p>
        This OTP is valid for 1 minute.
        If you did not request this, please ignore this email.
      </p>

      <p>
        Thank you,<br/>
        TrackEx Team
      </p>
    </div>
  `;

  const raw = createRawMessage({
    from: process.env.GMAIL_USER,
    to: email,
    subject: `TrackEx: ${label}`,
    html,
  });

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return response.data;
};

module.exports = {
  sendOtpEmail,
};