import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// Optionally load CA certificate if provided
let sslOptions = {};
if (process.env.CA_CERT) {
  sslOptions = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.resolve(__dirname, process.env.CA_CERT))
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslOptions
});

pool.getConnection()
  .then(conn => {
    console.log("✅ Connected to Aiven MySQL");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
  });

export default pool;