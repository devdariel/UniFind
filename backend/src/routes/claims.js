const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

async function logStatusChange({ itemId, oldStatus, newStatus, changedByUserId, reason }) {
  await pool.execute(
    `INSERT INTO item_status_history (item_id, old_status, new_status, changed_by_user_id, change_reason)
     VALUES (?, ?, ?, ?, ?)`,
    [itemId, oldStatus ?? null, newStatus, changedByUserId ?? null, reason ?? null]
  );
}

/**
 * STUDENT: Submit a claim for a FOUND item
 * POST /claims
 * body: { itemId, proofText? }
 */
router.post("/", requireAuth, requireRole("STUDENT"), async (req, res) => {
  const { itemId, proofText } = req.body || {};
  const id = Number(itemId);
  if (!id) return res.status(400).json({ error: "Missing itemId" });

  // item must exist and be FOUND
  const [items] = await pool.execute(
    `SELECT id, status FROM items WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!items.length) return res.status(404).json({ error: "Item not found" });
  if (items[0].status !== "FOUND") {
    return res.status(400).json({ error: "Item must be FOUND to claim" });
  }

  // prevent duplicate pending claim for same student + item
  const [existing] = await pool.execute(
    `SELECT id FROM claims WHERE item_id = ? AND student_user_id = ? AND status = 'PENDING' LIMIT 1`,
    [id, req.user.id]
  );
  if (existing.length) return res.status(409).json({ error: "You already have a pending claim for this item" });

  const [result] = await pool.execute(
    `INSERT INTO claims (item_id, student_user_id, proof_text, status)
     VALUES (?, ?, ?, 'PENDING')`,
    [id, req.user.id, proofText ?? null]
  );

  res.status(201).json({ claimId: result.insertId, status: "PENDING" });
});

/**
 * ADMIN: List claims (optional status filter)
 * GET /claims?status=PENDING|APPROVED|REJECTED
 */
router.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { status } = req.query;

  const params = [];
  let where = "";
  if (status) {
    where = "WHERE c.status = ?";
    params.push(status);
  }

  const sql = `
    SELECT
      c.id AS claim_id,
      c.status AS claim_status,
      c.proof_text,
      c.admin_note,
      c.created_at,
      i.id AS item_id,
      i.title,
      i.category,
      i.location,
      i.status AS item_status,
      u.id AS student_id,
      u.full_name AS student_name,
      u.email AS student_email
    FROM claims c
    JOIN items i ON i.id = c.item_id
    JOIN users u ON u.id = c.student_user_id
    ${where}
    ORDER BY c.created_at DESC
    LIMIT 100
  `;

  const [rows] = await pool.execute(sql, params);
  res.json({ count: rows.length, claims: rows });
});

/**
 * ADMIN: Approve claim
 * PATCH /claims/:id/approve
 * body: { adminNote? }
 *
 * Side effects:
 * - claim becomes APPROVED
 * - item becomes CLAIMED
 * - status history log
 */
router.patch("/:id/approve", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const claimId = Number(req.params.id);
  const { adminNote } = req.body || {};
  if (!claimId) return res.status(400).json({ error: "Invalid claim id" });

  const [claims] = await pool.execute(
    `SELECT id, item_id, status FROM claims WHERE id = ? LIMIT 1`,
    [claimId]
  );
  if (!claims.length) return res.status(404).json({ error: "Claim not found" });

  const claim = claims[0];
  if (claim.status !== "PENDING") return res.status(400).json({ error: "Only PENDING claims can be approved" });

  const [items] = await pool.execute(
    `SELECT id, status FROM items WHERE id = ? LIMIT 1`,
    [claim.item_id]
  );
  if (!items.length) return res.status(404).json({ error: "Item not found" });

  const oldStatus = items[0].status;
  if (oldStatus !== "FOUND") return res.status(400).json({ error: "Item must be FOUND to approve claim" });

  // update claim
  await pool.execute(
    `UPDATE claims
     SET status='APPROVED', admin_note=?, reviewed_by_admin_id=?, reviewed_at=NOW()
     WHERE id=?`,
    [adminNote ?? null, req.user.id, claimId]
  );

  // update item status -> CLAIMED
  await pool.execute(
    `UPDATE items SET status='CLAIMED' WHERE id=?`,
    [claim.item_id]
  );

  await logStatusChange({
    itemId: claim.item_id,
    oldStatus,
    newStatus: "CLAIMED",
    changedByUserId: req.user.id,
    reason: adminNote || "Claim approved",
  });

  res.json({ claimId, claimStatus: "APPROVED", itemId: claim.item_id, itemStatus: "CLAIMED" });
});

/**
 * ADMIN: Reject claim
 * PATCH /claims/:id/reject
 * body: { adminNote }
 */
router.patch("/:id/reject", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const claimId = Number(req.params.id);
  const { adminNote } = req.body || {};
  if (!claimId) return res.status(400).json({ error: "Invalid claim id" });
  if (!adminNote) return res.status(400).json({ error: "adminNote is required for rejection" });

  const [claims] = await pool.execute(
    `SELECT id, status FROM claims WHERE id = ? LIMIT 1`,
    [claimId]
  );
  if (!claims.length) return res.status(404).json({ error: "Claim not found" });

  const claim = claims[0];
  if (claim.status !== "PENDING") return res.status(400).json({ error: "Only PENDING claims can be rejected" });

  await pool.execute(
    `UPDATE claims
     SET status='REJECTED', admin_note=?, reviewed_by_admin_id=?, reviewed_at=NOW()
     WHERE id=?`,
    [adminNote, req.user.id, claimId]
  );

  res.json({ claimId, claimStatus: "REJECTED" });
});

module.exports = router;
