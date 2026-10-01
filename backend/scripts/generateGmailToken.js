const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
];

const CREDENTIALS_PATH = path.join(
  __dirname,
  "gmail-credentials.json"
);

async function generateToken() {
  try {
    console.log("Opening Google authorization...");

    const auth = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });

    console.log("\n========================================");
    console.log("Google authorization successful!");
    console.log("========================================\n");

    console.log("Refresh Token:");
    console.log(auth.credentials.refresh_token);

    console.log("\nAccess Token:");
    console.log(auth.credentials.access_token);

    console.log("\n========================================");
    console.log(
      "Copy the REFRESH TOKEN and store it securely."
    );
    console.log("========================================\n");
  } catch (error) {
    console.error(
      "Error during Google authorization:",
      error.message
    );
  }
}

generateToken();