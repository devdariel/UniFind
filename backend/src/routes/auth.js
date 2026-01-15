const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { universityId, fullName, email, password, role } = req.body || {};
  if (!universityId || !fullName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const safeRole = role === "ADMIN" ? "ADMIN" : "STUDENT";
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.execute(
      `INSERT INTO users (university_id, full_name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [universityId, fullName, email, passwordHash, safeRole]
    );

    res.status(201).json({
      id: result.insertId,
      universityId,
      fullName,
      email,
      role: safeRole,
    });
  } catch {
    res.status(409).json({ error: "User already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

  const [rows] = await pool.execute(
    `SELECT id, full_name, email, password_hash, role
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );

  if (!rows.length) return res.status(401).json({ error: "Invalid email or password" });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, fullName: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role }
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
