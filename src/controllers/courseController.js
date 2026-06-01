/**const pool = require("../config/db");

exports.create = async (req,res)=>{
  const {title} = req.body;
  const r = await pool.query(
    "INSERT INTO courses(title,instructor_id) VALUES($1,$2) RETURNING *",
    [title, req.user.id]
  );
  res.json(r.rows[0]);
};

exports.getAll = async (req,res)=>{
  const r = await pool.query("SELECT * FROM courses");
  res.json(r.rows);
};
**/
const pool = require("../config/db");

exports.createCourse = async (req, res) => {
  try {
    const { title, code } = req.body;

    const result = await pool.query(
      "INSERT INTO courses (title, code, instructor_id) VALUES ($1,$2,$3) RETURNING *",
      [title, code, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**exports.getCourses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};**/
exports.getCourses = async (
  req,
  res
) => {

  try {

    let result;

    // ADMIN
    if (
      req.user.role === "admin"
    ) {

      result = await pool.query(
        "SELECT * FROM courses"
      );

    }

    // INSTRUCTOR
    else if (
      req.user.role === "instructor"
    ) {

      result = await pool.query(
        `
        SELECT *
        FROM courses
        WHERE instructor_id = $1
        `,
        [req.user.id]
      );

    }

    // STUDENT
    else {

      result = await pool.query(
        `
        SELECT c.*
        FROM courses c
        JOIN enrollments e
        ON c.id = e.course_id
        WHERE e.user_id = $1
        `,
        [req.user.id]
      );

    }

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};
exports.getAllCourses = async (
  req,
  res
) => {

  try {

    const result =
      await pool.query(
        `
        SELECT
          c.*,
          u.name AS instructor_name
        FROM courses c
        LEFT JOIN users u
        ON c.instructor_id = u.id
        ORDER BY c.created_at DESC
        `
      );

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};