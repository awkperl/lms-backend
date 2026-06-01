/**const pool = require("../config/db");

// CREATE SUBMISSION
/**exports.create = async (req, res) => {
  try {
    const { assignment_id, user_id, link, file_url } = req.body;

    const result = await pool.query(
      `INSERT INTO submissions (assignment_id, user_id, link, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [assignment_id, user_id, link || null, file_url || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Submission failed" });
  }
};**/

// GET SUBMISSIONS BY ASSIGNMENT
/**exports.getByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await pool.query(
      `SELECT * FROM submissions WHERE assignment_id = $1 ORDER BY created_at DESC`,
      [assignmentId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};**/
const pool = require("../config/db");
const { createNotification } = require("../services/notificationService");

exports.submitAssignment = async (req, res) => {
  try {
    const { assignment_id, submission_type, content, file_url } = req.body;

    // 1️⃣ Get assignment details
    const assignmentRes = await pool.query(
      "SELECT * FROM assignments WHERE id=$1",
      [assignment_id]
    );

    const assignment = assignmentRes.rows[0];

    if (!assignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    // 2️⃣ Check deadline
    const now = new Date();
    if (assignment.due_date && now > assignment.due_date) {
      return res.status(400).json({ msg: "Deadline passed" });
    }

    // 3️⃣ Check attempts
    const attemptsRes = await pool.query(
      `SELECT COUNT(*) FROM submissions 
       WHERE assignment_id=$1 AND student_id=$2`,
      [assignment_id, req.user.id]
    );

    const attempts = parseInt(attemptsRes.rows[0].count);

    if (attempts >= assignment.attempt_limit) {
      return res.status(400).json({ msg: "Attempt limit reached" });
    }

    // 4️⃣ Insert submission
    const result = await pool.query(
      `INSERT INTO submissions 
       (assignment_id, student_id, submission_type, content, file_url, attempt_number)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        assignment_id,
        req.user.id,
        submission_type,
        content,
        file_url,
        attempts + 1
      ]
    );

    res.json(result.rows[0]);
    // notify instructor
await createNotification(
  assignment.instructor_id,
  `New submission for assignment: ${assignment.title}`
);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await pool.query(
      "SELECT * FROM submissions WHERE assignment_id=$1",
      [assignmentId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**const pool = require("../config/db");
const { createNotification } = require("../services/notificationService");

exports.submitAssignment = async (req, res) => {
  try {
    const {
      assignment_id,
      submission_type,
      content,
      file_url
    } = req.body;

    const student_id = req.user.id;

    // 1️⃣ Fetch assignment
    const assignmentRes = await pool.query(
      "SELECT * FROM assignments WHERE id=$1",
      [assignment_id]
    );

    const assignment = assignmentRes.rows[0];

    if (!assignment) {
      return res.status(404).json({
        msg: "Assignment not found"
      });
    }

    // 2️⃣ Check deadline
    const now = new Date();
    const due = assignment.due_date
      ? new Date(assignment.due_date)
      : null;

    const deadline_passed =
      due ? now > due : false;

    if (deadline_passed) {
      return res.status(400).json({
        msg: "Deadline passed"
      });
    }

    // 3️⃣ Get attempt count
    const attemptsRes = await pool.query(
      `SELECT COUNT(*) FROM submissions
       WHERE assignment_id=$1 AND student_id=$2`,
      [assignment_id, student_id]
    );

    const attempts = parseInt(
      attemptsRes.rows[0].count
    );

    const attempt_limit =
      assignment.attempt_limit || 1;

    const attempts_left =
      attempt_limit - attempts;

    // 4️⃣ Enforce attempt limit
    if (attempts_left <= 0) {
      return res.status(400).json({
        msg: "Attempt limit reached"
      });
    }

    // 5️⃣ Insert submission
    const result = await pool.query(
      `INSERT INTO submissions 
      (assignment_id, student_id, submission_type, content, file_url, attempt_number)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        assignment_id,
        student_id,
        submission_type,
        content,
        file_url,
        attempts + 1
      ]
    );

    const submission = result.rows[0];

    // 6️⃣ Notify instructor (safe fallback)
    if (assignment.instructor_id) {
      await createNotification(
        assignment.instructor_id,
        `New submission: ${assignment.title}`
      );
    }

    res.json({
      success: true,
      submission
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};**/