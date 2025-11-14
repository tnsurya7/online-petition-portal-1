// backend/createAdmin.js
import pool from "./db.js";
import bcrypt from "bcryptjs";
const create = async () => {
  const pwd = await bcrypt.hash("surya777", 10);
  const [r] = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Surya Admin", "surya@gmail.com", pwd, "admin"]
  );
  console.log("admin created id:", r.insertId);
  process.exit(0);
};
create().catch(e => { console.error(e); process.exit(1); });