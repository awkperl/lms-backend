const pool = require("../config/db");
const { createNotification } = require("../services/notificationService");

/**exports.gradeSubmission = async (req, res) => {
  try {
    const { submission_id, score, feedback } = req.body;

    // Check if already graded
    const existing = await pool.query(
      "SELECT * FROM grades WHERE submission_id=$1",
      [submission_id]
    );

    if (existing.rows.length > 0) {
      // Update existing grade
      const updated = await pool.query(
        `UPDATE grades 
         SET score=$1, feedback=$2, graded_by=$3, graded_at=NOW()
         WHERE submission_id=$4 RETURNING *`,
        [score, feedback, req.user.id, submission_id]
      );

      return res.json(updated.rows[0]);
    }

    // Insert new grade
    const result = await pool.query(
      `INSERT INTO grades (submission_id, score, feedback, graded_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [submission_id, score, feedback, req.user.id]
    );

    // after grading
await createNotification(
  student_id, // we fetch this from submission
  `Your assignment has been graded. Score: ${score}`
);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
**/
exports.gradeSubmission = async (req, res) => {

  try {

    const {
      submission_id,
      score,
      feedback
    } = req.body;

    // CHECK EXISTING GRADE
    const existing = await pool.query(
      "SELECT * FROM grades WHERE submission_id=$1",
      [submission_id]
    );

    let gradeResult;

    // UPDATE EXISTING GRADE
    if (existing.rows.length > 0) {

      gradeResult = await pool.query(
        `UPDATE grades
         SET
           score=$1,
           feedback=$2,
           graded_by=$3,
           graded_at=NOW()
         WHERE submission_id=$4
         RETURNING *`,
        [
          score,
          feedback,
          req.user.id,
          submission_id
        ]
      );

    } else {

      // CREATE NEW GRADE
      gradeResult = await pool.query(
        `INSERT INTO grades
        (
          submission_id,
          score,
          feedback,
          graded_by
        )
        VALUES ($1,$2,$3,$4)
        RETURNING *`,
        [
          submission_id,
          score,
          feedback,
          req.user.id
        ]
      );

    }

    // 🚀 UPDATE SUBMISSIONS TABLE TOO
    await pool.query(
      `UPDATE submissions
       SET
         score=$1,
         feedback=$2,
         graded_by=$3,
         graded_at=NOW()
       WHERE id=$4`,
      [
        score,
        feedback,
        req.user.id,
        submission_id
      ]
    );

    // GET STUDENT
    const submissionRes = await pool.query(
      `SELECT * FROM submissions
       WHERE id=$1`,
      [submission_id]
    );

    const submission =
      submissionRes.rows[0];

    // NOTIFY STUDENT
    if (submission?.student_id) {

      await createNotification(
        submission.student_id,
        `Your assignment has been graded. Score: ${score}`
      );

    }

    res.json({
      success: true,
      grade: gradeResult.rows[0]
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};
exports.getGradesForStudent = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, s.assignment_id
       FROM grades g
       JOIN submissions s ON g.submission_id = s.id
       WHERE s.student_id = $1`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};