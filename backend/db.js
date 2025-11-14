import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log("🔗 Connecting to:", process.env.DB_HOST);

let sslConfig = null;

// If Render has a mounted secret file, load it
const caPath = "/etc/secrets/aiven-ca.pem";

if (fs.existsSync(caPath)) {
  console.log("🟢 Using Aiven SSL certificate");
  sslConfig = {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true
  };
} else {
  console.log("🟡 No SSL cert found → running in local mode");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: sslConfig
});

export default pool;