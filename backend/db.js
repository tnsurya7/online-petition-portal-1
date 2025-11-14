import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

console.log("🔗 Connecting to MySQL Host:", process.env.DB_HOST);

let sslConfig = {};

try {
  const caPath = process.env.AIVEN_PEM_PATH || "/etc/secrets/aiven-ca.pem";

  if (fs.existsSync(caPath)) {
    console.log("🟢 Using Aiven SSL certificate");
    sslConfig = {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true
    };
  } else {
    console.log("🟡 No SSL file found → SSL disabled (Local Mode)");
  }
} catch (err) {
  console.log("⚠️ SSL load error, running without SSL:", err.message);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
});

export default pool;