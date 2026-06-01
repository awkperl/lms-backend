const pool = require("../config/db");

/**exports.enroll = async (req, res) => {
  try {
    const { course_id } = req.body;

    const result = await pool.query(
      "INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2) RETURNING *",
      [req.user.id, course_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};**/
exports.enroll = async (req, res) => {

  try {

    const { course_id } = req.body;

    // CHECK EXISTING ENROLLMENT
    const existing =
      await pool.query(
        `
        SELECT *
        FROM enrollments
        WHERE user_id = $1
        AND course_id = $2
        `,
        [req.user.id, course_id]
      );

    // ALREADY ENROLLED
    if (existing.rows.length > 0) {

      return res.status(400).json({
        msg: "Already enrolled"
      });

    }

    // CREATE ENROLLMENT
    const result =
      await pool.query(
        `
        INSERT INTO enrollments
        (user_id, course_id)
        VALUES ($1,$2)
        RETURNING *
        `,
        [req.user.id, course_id]
      );

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.* FROM courses c
       JOIN enrollments e ON c.id = e.course_id
       WHERE e.user_id = $1`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};