const pool = require("../config/db");

exports.createQuiz = async (req, res) => {
  try {

    const {
      course_id,
      title,
      time_limit
    } = req.body;

    if (!course_id || !title || !time_limit) {
      return res.status(400).json({
        msg: "course_id, title and time_limit are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO quizzes
      (course_id, title, time_limit)
      VALUES ($1,$2,$3)
      RETURNING *`,
      [
        course_id,
        title,
        time_limit
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

exports.getQuizzes = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM quizzes ORDER BY created_at DESC"
    );

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};
/**exports.startQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.body;

    const quizRes = await pool.query(
      "SELECT * FROM quizzes WHERE id=$1",
      [quiz_id]
    );

    const quiz = quizRes.rows[0];

    if (!quiz) return res.status(404).json({ msg: "Quiz not found" });

    const now = new Date();

    // Availability check
    if (quiz.available_from && now < quiz.available_from) {
      return res.status(400).json({ msg: "Quiz not yet available" });
    }

    if (quiz.due_at && now > quiz.due_at) {
      return res.status(400).json({ msg: "Quiz expired" });
    }

    // Create attempt
    const endTime = new Date(now.getTime() + quiz.time_limit * 60000);

    const attempt = await pool.query(
      `INSERT INTO quiz_attempts (quiz_id, user_id, start_time, end_time)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [quiz_id, req.user.id, now, endTime]
    );

    res.json(attempt.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};**/
exports.startQuiz = async (req, res) => {
  try {

    const { quiz_id } = req.body;

    const quizRes = await pool.query(
      "SELECT * FROM quizzes WHERE id=$1",
      [quiz_id]
    );

    if (quizRes.rows.length === 0) {
      return res.status(404).json({
        msg: "Quiz not found"
      });
    }

    const quiz = quizRes.rows[0];

    const now = new Date();

    const endTime = new Date(
      now.getTime() + quiz.time_limit * 60000
    );

    const attempt = await pool.query(
      `INSERT INTO quiz_attempts
      (quiz_id, student_id, start_time, end_time, submitted)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        quiz_id,
        req.user.id,
        now,
        endTime,
        false
      ]
    );

    res.json({
      message: "Quiz started successfully",
      attempt: attempt.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
};
/**exports.saveAnswer = async (req, res) => {
  try {
    const { attempt_id, question_id, answer } = req.body;

    await pool.query(
      `INSERT INTO answers (attempt_id, question_id, answer)
       VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING`,
      [attempt_id, question_id, answer]
    );

    res.json({ msg: "Answer saved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};**/
exports.saveAnswer = async (req, res) => {
  try {

    const {
      attempt_id,
      question_id,
      answer
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO answers
      (attempt_id, question_id, answer)
      VALUES ($1,$2,$3)

      ON CONFLICT (attempt_id, question_id)

      DO UPDATE
      SET answer = EXCLUDED.answer

      RETURNING *;
      `,
      [
        attempt_id,
        question_id,
        answer
      ]
    );

    res.json({
      message: "Answer saved",
      answer: result.rows[0]
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};
/**exports.submitQuiz = async (req, res) => {
  try {
    const { attempt_id } = req.body;

    const attemptRes = await pool.query(
      "SELECT * FROM quiz_attempts WHERE id=$1",
      [attempt_id]
    );

    const attempt = attemptRes.rows[0];

    if (!attempt) {
      return res.status(404).json({ msg: "Attempt not found" });
    }

    const now = new Date();

    // Autosubmission
    if (now > attempt.end_time) {
      return res.status(400).json({
        msg: "Time expired. Auto-submitted."
      });
    }

    await pool.query(
      "UPDATE quiz_attempts SET submitted=true WHERE id=$1",
      [attempt_id]
    );

    res.json({ msg: "Quiz submitted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};**/
// GET ALL QUIZZES
/**exports.getQuizzes = async (req, res) => {
  try {

    const result = await pool.query(
      "SELECT * FROM quizzes ORDER BY created_at DESC"
    );
    const result = await pool.query(
  "SELECT * FROM quizzes ORDER BY title ASC"
);

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};**/

exports.submitQuiz = async (req, res) => {
  try {

    const { attempt_id } = req.body;

    // Get attempt
    const attemptRes = await pool.query(
      `SELECT *
       FROM quiz_attempts
       WHERE id=$1`,
      [attempt_id]
    );

    if (attemptRes.rows.length === 0) {
      return res.status(404).json({
        msg: "Quiz attempt not found"
      });
    }

    const attempt = attemptRes.rows[0];

    // Prevent multiple submissions
    if (attempt.submitted) {
      return res.status(400).json({
        msg: "Quiz already submitted"
      });
    }

    // Time validation
    const now = new Date();

    if (attempt.end_time && now > attempt.end_time) {
      return res.status(400).json({
        msg: "Time expired"
      });
    }

    // Get all saved answers
    const answersRes = await pool.query(
      `
      SELECT
          a.question_id,
          a.answer,
          q.correct_answer
      FROM answers a
      JOIN questions q
      ON a.question_id=q.id
      WHERE a.attempt_id=$1
      `,
      [attempt_id]
    );

    let score = 0;

    answersRes.rows.forEach(ans => {

      if (
        ans.answer &&
        ans.correct_answer &&
        ans.answer.trim().toLowerCase() ===
        ans.correct_answer.trim().toLowerCase()
      ) {
        score++;
      }

    });

    // Save score
    await pool.query(
      `
      UPDATE quiz_attempts
      SET
          score=$1,
          submitted=TRUE
      WHERE id=$2
      `,
      [
        score,
        attempt_id
      ]
    );

    res.json({

      message: "Quiz submitted successfully",

      totalQuestions: answersRes.rows.length,

      score,

      percentage:
        answersRes.rows.length === 0
          ? 0
          : Math.round(
              score * 100 /
              answersRes.rows.length
            )

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
};

// GET QUIZ QUESTIONS
exports.getQuizQuestions = async (req, res) => {
  try {

    const { quizId } = req.params;

    /**const questions = await pool.query(
      //`SELECT * FROM questions
      // WHERE quiz_id=$1
      // ORDER BY created_at ASC`,
     // [quizId]
   // );**/
    const questions = await pool.query(
  `SELECT * FROM questions
   WHERE quiz_id=$1`,
  [quizId]
);

    res.json(questions.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};
/**exports.createQuestion = async (req, res) => {
  try {

    const {
      quiz_id,
      question,
      correct_answer
    } = req.body;

    const result = await pool.query(
      `INSERT INTO questions
       (quiz_id, question, correct_answer)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [
        quiz_id,
        question,
        correct_answer
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};**/
/**exports.createQuestion = async (req, res) => {
  try {

    const {
      quiz_id,
      question,
      options,
      correct_answer
    } = req.body;
    const result = await pool.query(
      `INSERT INTO questions
      (quiz_id, question, options, correct_answer)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [
        quiz_id,
        question,
        options,
        correct_answer
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};**/
/**exports.createQuestion = async (req, res) => {

  console.log("BODY:", req.body);

  return res.json(req.body);

};**/
exports.createQuestion = async (req, res) => {
  try {

    const {
      quiz_id,
      question,
      options,
      correct_answer
    } = req.body;

    const result = await pool.query(
      `INSERT INTO questions
      (quiz_id, question, options, correct_answer)
      VALUES ($1,$2,$3::jsonb,$4)
      RETURNING *`,
      [
        quiz_id,
        question,
        options ? JSON.stringify(options) : null,
        correct_answer
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
      detail: err.detail
    });

  }
};

/**exports.createQuestion = async (req, res) => {

  try {

    const {
      quiz_id,
      question,
      options,
      correct_answer
    } = req.body;

    const result = await pool.query(

      `INSERT INTO questions
      (quiz_id, question, options, correct_answer)
      VALUES ($1,$2,$3::jsonb,$4)
      RETURNING *`,

      [
        quiz_id,
        question,
        options
          ? JSON.stringify(options)
          : null,
        correct_answer
      ]

    );

    res.status(201).json(
      result.rows[0]
    );

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

};**/
exports.createQuestion = async (req, res) => {

  try {

    const {
      quiz_id,
      question,
      options,
      correct_answer
    } = req.body;

    const result = await pool.query(

      `INSERT INTO questions
      (quiz_id, question, options, correct_answer)
      VALUES ($1,$2,$3::jsonb,$4)
      RETURNING *`,

      [
        quiz_id,
        question,
        options
          ? JSON.stringify(options)
          : null,
        correct_answer
      ]

    );

    res.status(201).json(
      result.rows[0]
    );

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

};
