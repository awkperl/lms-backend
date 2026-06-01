//const pool = require("../config/db");

/**exports.create = async (req,res)=>{
  const {course_id,title} = req.body;
  const r = await pool.query(
    "INSERT INTO assignments(course_id,title) VALUES($1,$2) RETURNING *",
    [course_id,title]
  );
  res.json(r.rows[0]);
};**/
/** 
exports.getByCourse = async (req,res)=>{
  const r = await pool.query(
    "SELECT * FROM assignments WHERE course_id=$1",
    [req.params.courseId]
  );
  res.json(r.rows);
};
**/
/**exports.create = async (req, res) => {
  try {
    const { course_id, title } = req.body;

    // ✅ VALIDATION HERE
    if (!course_id || course_id === "COURSE_ID") {
      return res.status(400).json({ msg: "Invalid course_id" });
    }

    if (!title) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const r = await pool.query(
      "INSERT INTO assignments(course_id,title) VALUES($1,$2) RETURNING *",
      [course_id, title]
    );

    res.json(r.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
exports.getByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // ✅ VALIDATION HERE
    if (!courseId || courseId === "COURSE_ID") {
      return res.status(400).json({ msg: "Invalid course ID" });
    }

    const r = await pool.query(
      "SELECT * FROM assignments WHERE course_id=$1",
      [courseId]
    );

    res.json(r.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
**/
const pool = require("../config/db");

exports.createAssignment = async (req, res) => {
  try {
    const { course_id, title, description, due_date, attempt_limit } = req.body;

    const result = await pool.query(
      `INSERT INTO assignments (course_id, title, description, due_date, attempt_limit)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [course_id, title, description, due_date, attempt_limit || 1]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      "SELECT * FROM assignments WHERE course_id=$1",
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id; // from auth middleware

    // 1. Get assignments
    const assignmentsResult = await pool.query(
      "SELECT * FROM assignments WHERE course_id=$1",
      [courseId]
    );

    const assignments = assignmentsResult.rows;

    // 2. Get all submissions by this user for this course
    const submissionsResult = await pool.query(
      `SELECT * FROM submissions
       WHERE course_id=$1 AND user_id=$2`,
      [courseId, userId]
    );

    const submissions = submissionsResult.rows;

    // 3. Enrich assignments
    const enriched = assignments.map((a) => {

      const userSubmissions = submissions.filter(
        (s) => s.assignment_id === a.id
      );

      const attempts_used = userSubmissions.length;

      const attempts_left =
        (a.attempt_limit || 1) - attempts_used;

      const now = new Date();
      const due = a.due_date ? new Date(a.due_date) : null;

      const deadline_passed = due ? now > due : false;

      const is_locked =
        attempts_left <= 0 || deadline_passed;

      return {
        ...a,
        attempts_used,
        attempts_left,
        deadline_passed,
        is_locked
      };
    });

    res.json(enriched);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/**exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id; // from auth middleware

    // 1. Get assignments
    const assignmentsResult = await pool.query(
      "SELECT * FROM assignments WHERE course_id=$1",
      [courseId]
    );

    const assignments = assignmentsResult.rows;

    // 2. Get all submissions by this user for this course
    const submissionsResult = await pool.query(
      `SELECT * FROM submissions
       WHERE course_id=$1 AND user_id=$2`,
      [courseId, userId]
    );

    const submissions = submissionsResult.rows;

    // 3. Enrich assignments
    const enriched = assignments.map((a) => {

      const userSubmissions = submissions.filter(
        (s) => s.assignment_id === a.id
      );

      const attempts_used = userSubmissions.length;

      const attempts_left =
        (a.attempt_limit || 1) - attempts_used;

      const now = new Date();
      const due = a.due_date ? new Date(a.due_date) : null;

      const deadline_passed = due ? now > due : false;

      const is_locked =
        attempts_left <= 0 || deadline_passed;

      return {
        ...a,
        attempts_used,
        attempts_left,
        deadline_passed,
        is_locked
      };
    });

    res.json(enriched);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};**/
exports.getAssignmentsByCourse = async (req, res) => {
  try {

    const { courseId } = req.params;
    const userId = req.user?.id;

    // 1️⃣ Get assignments
    const assignmentsResult = await pool.query(
      "SELECT * FROM assignments WHERE course_id=$1",
      [courseId]
    );

    const assignments = assignmentsResult.rows;

    // 2️⃣ Get submissions for this student
    const submissionsResult = await pool.query(
      `SELECT s.*
       FROM submissions s
       JOIN assignments a
       ON s.assignment_id = a.id
       WHERE a.course_id=$1
       AND s.student_id=$2`,
      [courseId, userId]
    );

    const submissions = submissionsResult.rows;

    // 3️⃣ Enrich assignments
    const enriched = assignments.map((a) => {

      const userSubmissions = submissions.filter(
        (s) => String(s.assignment_id) === String(a.id)
      );

      const attempts_used =
        userSubmissions.length;

      const attempts_left =
        (a.attempt_limit || 1) -
        attempts_used;

      const now = new Date();

      const due = a.due_date
        ? new Date(a.due_date)
        : null;

      const deadline_passed =
        due ? now > due : false;

      const is_locked =
        attempts_left <= 0 ||
        deadline_passed;

      return {
        ...a,
        attempts_used,
        attempts_left,
        deadline_passed,
        is_locked
      };
    });

    res.json(enriched);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};