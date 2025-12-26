const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "partnr_user",
  password: "partnr_pass",
  database: "partnr_db",
});

pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
