const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/db');

async function reset() {
  const newHash = await bcrypt.hash('Admin@123', 10);
  const result = await pool.query('UPDATE users SET password_hash = $1', [newHash]);
  console.log('✅ Updated', result.rowCount, 'users to password: Admin@123');
  await pool.end();
  process.exit(0);
}

reset().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
