const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * ADMIN: List all items with optional filters
 * GET /admin/items?status=&category=&q=&from=&to=
 */
router.get("/items", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { status, category, q, from, to } = req.query;

  const where = [];
  const params = [];

  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (category) {
    where.push("category = ?");
    params.push(category);
  }
  if (q) {
    where.push("(title LIKE ? OR description LIKE ? OR location LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (from) {
    where.push("event_date >= ?");
    params.push(from);
  }
  if (to) {
    where.push("event_date <= ?");
    params.push(to);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT id, title, category, status, location, event_date, created_at, updated_at
    FROM items
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT 200
  `;

  const [rows] = await pool.execute(sql, params);
  res.json({ count: rows.length, items: rows });
});

/**
 * ADMIN: List LOST items
 * GET /admin/items/lost
 */
router.get("/items/lost", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, title, category, status, location, event_date, created_at
     FROM items
     WHERE status = 'LOST'
     ORDER BY created_at DESC
     LIMIT 200`
  );
  res.json({ count: rows.length, items: rows });
});

/**
 * ADMIN: List CLAIMED items
 * GET /admin/items/claimed
 */
router.get("/items/claimed", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, title, category, status, location, event_date, created_at
     FROM items
     WHERE status = 'CLAIMED'
     ORDER BY created_at DESC
     LIMIT 200`
  );
  res.json({ count: rows.length, items: rows });
});

module.exports = router;
