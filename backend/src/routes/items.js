const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * Helper: insert status history row
 */
async function logStatusChange({ itemId, oldStatus, newStatus, changedByUserId, reason }) {
  await pool.execute(
    `INSERT INTO item_status_history (item_id, old_status, new_status, changed_by_user_id, change_reason)
     VALUES (?, ?, ?, ?, ?)`,
    [itemId, oldStatus, newStatus, changedByUserId ?? null, reason ?? null]
  );
}

/**
 * STUDENT: Report a LOST item
 * POST /items/lost
 */
router.post("/lost", requireAuth, requireRole("STUDENT"), async (req, res) => {
  const { title, description, category, location, eventDate } = req.body || {};
  if (!title || !description || !location || !eventDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const status = "LOST";
  const [result] = await pool.execute(
    `INSERT INTO items (title, description, category, status, location, event_date, reported_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, category || "OTHER", status, location, eventDate, req.user.id]
  );

  await logStatusChange({
    itemId: result.insertId,
    oldStatus: null,
    newStatus: status,
    changedByUserId: req.user.id,
    reason: "Initial lost item report",
  });

  res.status(201).json({ id: result.insertId, status });
});

/**
 * ADMIN: Register a FOUND item
 * POST /items/found
 */
router.post("/found", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { title, description, category, location, eventDate } = req.body || {};
  if (!title || !description || !location || !eventDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const status = "FOUND";
  const [result] = await pool.execute(
    `INSERT INTO items (title, description, category, status, location, event_date, registered_by_admin_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, category || "OTHER", status, location, eventDate, req.user.id]
  );

  await logStatusChange({
    itemId: result.insertId,
    oldStatus: null,
    newStatus: status,
    changedByUserId: req.user.id,
    reason: "Initial found item registration",
  });

  res.status(201).json({ id: result.insertId, status });
});

/**
 * PUBLIC (auth not required): List FOUND items + filters
 * GET /items/found?category=&q=&from=&to=
 */
router.get("/found", async (req, res) => {
  const { category, q, from, to } = req.query;

  const where = [`status = 'FOUND'`];
  const params = [];

  if (category) {
    where.push(`category = ?`);
    params.push(category);
  }
  if (q) {
    where.push(`(title LIKE ? OR description LIKE ? OR location LIKE ?)`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (from) {
    where.push(`event_date >= ?`);
    params.push(from);
  }
  if (to) {
    where.push(`event_date <= ?`);
    params.push(to);
  }

  const sql = `
    SELECT id, title, description, category, status, location, event_date, created_at
    FROM items
    WHERE ${where.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT 100
  `;

  const [rows] = await pool.execute(sql, params);
  res.json({ count: rows.length, items: rows });
});

/**
 * ADMIN: Update item status (FOUND -> CLAIMED/ARCHIVED etc.)
 * PATCH /items/:id/status
 * body: { newStatus, reason? }
 */
router.patch("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const itemId = Number(req.params.id);
  const { newStatus, reason } = req.body || {};

  if (!itemId || !newStatus) return res.status(400).json({ error: "Missing itemId or newStatus" });

  const [existingRows] = await pool.execute(
    `SELECT id, status FROM items WHERE id = ? LIMIT 1`,
    [itemId]
  );
  if (!existingRows.length) return res.status(404).json({ error: "Item not found" });

  const oldStatus = existingRows[0].status;

  await pool.execute(
    `UPDATE items SET status = ? WHERE id = ?`,
    [newStatus, itemId]
  );

  await logStatusChange({
    itemId,
    oldStatus,
    newStatus,
    changedByUserId: req.user.id,
    reason: reason || "Admin status update",
  });

  res.json({ id: itemId, oldStatus, newStatus });
});

module.exports = router;
