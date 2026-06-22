/**const pool = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Courses
    const courses = await pool.query(
      `SELECT c.* FROM courses c
       JOIN enrollments e ON c.id = e.course_id
       WHERE e.user_id = $1`,
      [userId]
    );

    // Recent assignments
    const assignments = await pool.query(
      `SELECT a.* FROM assignments a
       JOIN enrollments e ON a.course_id = e.course_id
       WHERE e.user_id = $1
       ORDER BY due_date ASC LIMIT 5`,
      [userId]
    );

    // Notifications
    const notifications = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id=$1
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    res.json({
      courses: courses.rows,
      assignments: assignments.rows,
      notifications: notifications.rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};**/
const pool = require("../config/db");

exports.getDashboard = async (req, res) => {

  try {

    const userId = req.user.id;
    const role = req.user.role;

    // ======================
    // EXISTING DASHBOARD DATA
    // ======================

    const courses = await pool.query(
      `SELECT c.*
       FROM courses c
       JOIN enrollments e
       ON c.id=e.course_id
       WHERE e.user_id=$1`,
      [userId]
    );

    const assignments = await pool.query(
      `SELECT a.*
       FROM assignments a
       JOIN enrollments e
       ON a.course_id=e.course_id
       WHERE e.user_id=$1
       ORDER BY due_date ASC
       LIMIT 5`,
      [userId]
    );

    const notifications = await pool.query(
      `SELECT *
       FROM notifications
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    // ======================
    // NEW ANALYTICS
    // ======================

    let analytics = {};

    // STUDENT
    if (role === "student") {

     /**  const submissionCount =
      await pool.query(
        `SELECT COUNT(*)
         FROM submissions
         WHERE student_id=$1`,
        [userId]
      );

      const avgScore =
      await pool.query(
        `
        SELECT AVG(score) avg
        FROM submissions
        WHERE student_id=$1
        AND score IS NOT NULL
        `,
        [userId]
      );

      const quizAttempts =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM quiz_attempts
        WHERE student_id=$1
        `,
        [userId]
      );**/

      const submissionCount =
await pool.query(
  `SELECT COUNT(*)
   FROM submissions
   WHERE user_id=$1`,
  [userId]
);

const avgScore =
await pool.query(
  `
  SELECT AVG(g.score) avg
  FROM grades g
  JOIN submissions s
  ON g.submission_id = s.id
  WHERE s.user_id = $1
  `,
  [userId]
);
const quizAttempts =
await pool.query(
  `
  SELECT COUNT(*)
  FROM quiz_attempts
  WHERE user_id=$1
  `,
  [userId]
);

      analytics = {

        enrolledCourses:
          courses.rows.length,

        assignmentsSubmitted:
          submissionCount.rows[0].count,

        averageScore:
          Math.round(
            avgScore.rows[0].avg || 0
          ),

        quizAttempts:
          quizAttempts.rows[0].count
      };
    }

    // INSTRUCTOR
    else if (
      role === "instructor"
    ) {

      const myCourses =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM courses
        WHERE instructor_id=$1
        `,
        [userId]
      );

      const studentCount =
      await pool.query(
        `
        SELECT COUNT(DISTINCT e.user_id)
        FROM enrollments e
        JOIN courses c
        ON c.id=e.course_id
        WHERE c.instructor_id=$1
        `,
        [userId]
      );

      const totalSubmissions =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM submissions s
        JOIN assignments a
        ON s.assignment_id=a.id
        JOIN courses c
        ON a.course_id=c.id
        WHERE c.instructor_id=$1
        `,
        [userId]
      );

      analytics = {

        myCourses:
          myCourses.rows[0].count,

        students:
          studentCount.rows[0].count,

        submissions:
          totalSubmissions.rows[0].count
      };
    }

    // ADMIN
    else if (
      role === "admin"
    ) {

      const users =
      await pool.query(
        "SELECT COUNT(*) FROM users"
      );

      const totalCourses =
      await pool.query(
        "SELECT COUNT(*) FROM courses"
      );

      const totalEnrollments =
      await pool.query(
        "SELECT COUNT(*) FROM enrollments"
      );

      analytics = {

        users:
          users.rows[0].count,

        courses:
          totalCourses.rows[0].count,

        enrollments:
          totalEnrollments.rows[0].count
      };
    }

    res.json({

      courses:
        courses.rows,

      assignments:
        assignments.rows,

      notifications:
        notifications.rows,

      analytics

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};