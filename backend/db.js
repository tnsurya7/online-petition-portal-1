import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("🔗 Connecting to MySQL Host:", process.env.DB_HOST);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,

  // ✅ Aiven SSL certificate loaded from environment variable
  ssl: {
    ca: process.env.SSL_CERT
  },

  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
});

export default pool;