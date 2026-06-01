/**const pool = require("../config/db");

exports.gradeSubmission = async (req, res) => {
  try {
    const { submission_id, score, feedback } = req.body;

    const grader_id = req.user.id;

    // 1️⃣ Fetch submission
    const submissionRes = await pool.query(
      "SELECT * FROM submissions WHERE id=$1",
      [submission_id]
    );

    const submission = submissionRes.rows[0];

    if (!submission) {
      return res.status(404).json({
        msg: "Submission not found"
      });
    }

    // 2️⃣ Update grading
    const result = await pool.query(
      `UPDATE submissions
       SET score=$1,
           feedback=$2,
           graded_by=$3,
           graded_at=NOW()
       WHERE id=$4
       RETURNING *`,
      [score, feedback, grader_id, submission_id]
    );

    res.json({
      success: true,
      submission: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
exports.getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const result = await pool.query(
      `SELECT * FROM submissions WHERE id=$1`,
      [submissionId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};**/
const pool = require("../config/db");

exports.gradeSubmission = async (req, res) => {
  try {
    const { submission_id, score, feedback } = req.body;

    const grader_id = req.user.id;

    // 1️⃣ Fetch submission
    const submissionRes = await pool.query(
      "SELECT * FROM submissions WHERE id=$1",
      [submission_id]
    );

    const submission = submissionRes.rows[0];

    if (!submission) {
      return res.status(404).json({
        msg: "Submission not found"
      });
    }

    // 2️⃣ Update grading
    const result = await pool.query(
      `UPDATE submissions
       SET score=$1,
           feedback=$2,
           graded_by=$3,
           graded_at=NOW()
       WHERE id=$4
       RETURNING *`,
      [score, feedback, grader_id, submission_id]
    );

    res.json({
      success: true,
      submission: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
exports.getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const result = await pool.query(
      `SELECT * FROM submissions WHERE id=$1`,
      [submissionId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};