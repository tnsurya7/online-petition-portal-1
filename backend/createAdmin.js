// backend/createAdmin.js
import pool from "./db.js";
import bcrypt from "bcryptjs";

const create = async () => {
  const hashedPassword = await bcrypt.hash("surya707", 10);

  const [r] = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Surya Admin", "suryakumar@gmail.com", hashedPassword, "admin"]
  );

  console.log("Admin created with ID:", r.insertId);
  process.exit(0);
};

create().catch((e) => {
  console.error(e);
  process.exit(1);
});