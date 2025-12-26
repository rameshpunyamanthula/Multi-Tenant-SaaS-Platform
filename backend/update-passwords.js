// backend/update-passwords.js
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "partnr_user",
  password: "partnr_pass",
  database: "partnr_db",
});

async function updatePasswords() {
  try {
    const result = await pool.query(
      "UPDATE users SET password_hash = $1",
      ['$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW']
    );
    console.log("✅ Updated", result.rowCount, "users to password: Admin@123");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

updatePasswords();
