const pool = require("../config/db");

exports.createNotification = async (user_id, message) => {
  try {
    await pool.query(
      "INSERT INTO notifications (user_id, message) VALUES ($1,$2)",
      [user_id, message]
    );
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};