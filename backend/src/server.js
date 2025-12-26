// backend/src/server.js
const dotenv = require("dotenv");

// Load default .env (Docker / common settings)
dotenv.config();

// For local development, optionally override with .env.local if it exists
dotenv.config({ path: ".env.local", override: true });

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
