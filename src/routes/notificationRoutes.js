const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const pool = require("../config/db");

// Get my notifications
router.get("/", auth, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json(result.rows);
});

// Mark as read
router.put("/:id/read", auth, async (req, res) => {
  await pool.query(
    "UPDATE notifications SET is_read=true WHERE id=$1",
    [req.params.id]
  );
  res.json({ msg: "Marked as read" });
});

module.exports = router;