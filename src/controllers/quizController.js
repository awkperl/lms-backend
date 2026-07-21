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
exports.updateQuiz = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      title,
      time_limit
    } = req.body;

    const result = await pool.query(

      `UPDATE quizzes
       SET
         title = $1,
         time_limit = $2
       WHERE id = $3
       RETURNING *`,

      [
        title,
        time_limit,
        id
      ]

    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        error: "Quiz not found."

      });

    }

    res.json(result.rows[0]);

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      error: err.message

    });

  }

};

exports.deleteQuiz = async (req, res) => {

  try {

    const { id } = req.params;

    // Check if students have attempted this quiz
    const attempts = await pool.query(

      `SELECT id
       FROM quiz_attempts
       WHERE quiz_id = $1
       LIMIT 1`,

      [id]

    );

    if (attempts.rows.length > 0) {

      return res.status(400).json({

        error:
          "This quiz has already been attempted by students and cannot be deleted."

      });

    }

    // Delete questions first
    await pool.query(

      `DELETE FROM questions
       WHERE quiz_id = $1`,

      [id]

    );

    // Delete quiz
    const result = await pool.query(

      `DELETE FROM quizzes
       WHERE id = $1
       RETURNING *`,

      [id]

    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        error: "Quiz not found."

      });

    }

    res.json({

      message: "Quiz deleted successfully."

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      error: err.message

    });

  }

};

exports.updateQuestion = async (req, res) => {

  try {

    const { id } = req.params;

    const {
    question,
    type,
    options,
    correct_answer,
    points
    } = req.body;

    const result = await pool.query(

      `UPDATE questions
SET

question=$1,

type=$2,

options=$3::jsonb,

correct_answer=$4,

points=$5

WHERE id=$6

RETURNING *`,

      
        [
    question,
    type,
    options
        ? JSON.stringify(options)
        : null,
    correct_answer,
    points,
    id
]
      

    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Question not found"
      });

    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

};

exports.deleteQuestion = async (req, res) => {

  try {

    const { id } = req.params;

    // CHECK IF ANY STUDENT HAS ANSWERED THIS QUESTION
    const used = await pool.query(

      `SELECT id
       FROM answers
       WHERE question_id = $1
       LIMIT 1`,

      [id]

    );

    if (used.rows.length > 0) {

      return res.status(400).json({

        error:
          "This question has already been attempted by students and cannot be deleted."

      });

    }

    // DELETE QUESTION
    const result = await pool.query(

      `DELETE FROM questions
       WHERE id = $1
       RETURNING *`,

      [id]

    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        error: "Question not found."

      });

    }

    res.json({

      message: "Question deleted successfully."

    });

  }

  catch (err) {

    console.error(err);

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

   // Load quiz questions (student version)
const questions = await pool.query(
`
SELECT

id,

question,

type,

options,

points

FROM questions

WHERE quiz_id=$1

ORDER BY id ASC
`,
[quiz_id]
);
res.json({

  message: "Quiz started successfully",

  attempt: attempt.rows[0],

  quiz,

  questions: questions.rows

});

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
};

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
   const updateResult = await pool.query(
`
UPDATE quiz_attempts
SET
    score = $1,
    submitted = TRUE,
    submitted_at = NOW()
WHERE id = $2
RETURNING *
`,
[
    score,
    attempt_id
]
);

const totalQuestions = answersRes.rows.length;

const percentage =
    totalQuestions === 0
        ? 0
        : Math.round((score * 100) / totalQuestions);

res.json({

    message: "Quiz submitted successfully",

    score,

    totalQuestions,

    percentage,

    passed: percentage >= 50,

    attempt: updateResult.rows[0]

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
`
SELECT
id,
question,
type,
options,
correct_answer,
points
FROM questions
WHERE quiz_id=$1
ORDER BY id ASC
`,
[quizId]
);

    res.json(questions.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

exports.createQuestion = async (req, res) => {
  try {

    const {
  quiz_id,
  question,
  type,
  options,
  correct_answer,
  points
    } = req.body;

    const result = await pool.query(
      `INSERT INTO questions
(
    quiz_id,
    question,
    type,
    options,
    correct_answer,
    points
)
VALUES
(
    $1,
    $2,
    $3,
    $4::jsonb,
    $5,
    $6
)
RETURNING *`,
      [
        
    quiz_id,
    question,
    type || "multiple_choice",
    options
        ? JSON.stringify(options)
        : null,
    correct_answer || null,
    points || 1

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
exports.getStudentHistory = async (req, res) => {

    try {

        const result = await pool.query(

            `
      SELECT
      qa.id,
      qa.quiz_id,
      q.title,
      qa.score,
      qa.submitted,
      qa.start_time,
      qa.end_time,
      qa.submitted_at,
      COUNT(ques.id) AS total_questions
  FROM quiz_attempts qa
  JOIN quizzes q
      ON q.id = qa.quiz_id
  LEFT JOIN questions ques
      ON ques.quiz_id = q.id
  WHERE qa.student_id = $1
  GROUP BY
      qa.id,
      qa.quiz_id,
      q.title,
      qa.score,
      qa.submitted,
      qa.start_time,
      qa.end_time,
      qa.submitted_at
  ORDER BY qa.submitted_at DESC
            `,

            [req.user.id]

        );

        const history = result.rows.map(item => {

            const total = Number(item.total_questions);

            const score = Number(item.score || 0);

            const percentage =
                total === 0
                    ? 0
                    : Math.round(score * 100 / total);

            return {

                ...item,

                percentage,

                passed: percentage >= 50

            };

        });

        res.json(history);

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

};
exports.getQuizAttempts = async (req, res) => {

    try {

        const { quizId } = req.params;

        const attempts = await pool.query(

            `
            SELECT

                qa.id,

                qa.student_id,

                u.name AS student_name,

                q.title,

                qa.score,

                qa.submitted,

                qa.start_time,

                qa.end_time,

                qa.submitted_at,

                COUNT(ques.id) AS total_questions

            FROM quiz_attempts qa

            JOIN quizzes q
                ON q.id = qa.quiz_id

            JOIN users u
                ON u.id = qa.student_id

            LEFT JOIN questions ques
                ON ques.quiz_id = qa.quiz_id

            WHERE qa.quiz_id = $1

            GROUP BY

                qa.id,
                u.name,
                q.title

            ORDER BY qa.submitted_at DESC
            `,

            [quizId]

        );

        const results = attempts.rows.map(row => {

            const total = Number(row.total_questions);

            const score = Number(row.score || 0);

            const percentage =
                total === 0
                    ? 0
                    : Math.round(score * 100 / total);

            return {

                ...row,

                percentage,

                passed: percentage >= 50

            };

        });

        res.json(results);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

};

// GET A SINGLE STUDENT ATTEMPT
exports.getAttemptDetails = async (req, res) => {

  try {

    const { attemptId } = req.params;

    // Get attempt summary
    const attemptResult = await pool.query(

      `
      SELECT

          qa.id,

          qa.score,

          qa.submitted,

          qa.start_time,

          qa.end_time,

          qa.submitted_at,

          q.title AS quiz_title,

          u.name AS student_name,

          COUNT(ques.id) AS total_questions

      FROM quiz_attempts qa

      JOIN quizzes q
      ON qa.quiz_id = q.id

      JOIN users u
      ON qa.student_id = u.id

      LEFT JOIN questions ques
      ON ques.quiz_id = q.id

      WHERE qa.id = $1

      GROUP BY

          qa.id,

          qa.score,

          qa.submitted,

          qa.start_time,

          qa.end_time,

          qa.submitted_at,

          q.title,

          u.name
      `,

      [attemptId]

    );

    if (attemptResult.rows.length === 0) {

      return res.status(404).json({

        error: "Attempt not found."

      });

    }

    const attempt = attemptResult.rows[0];

    const totalQuestions = Number(attempt.total_questions);

    const score = Number(attempt.score || 0);

    const percentage =
      totalQuestions === 0
        ? 0
        : Math.round((score * 100) / totalQuestions);

    // Load every question together with the student's answer
    const questionsResult = await pool.query(

      `
      SELECT

          q.id,

          q.question,

          q.type,

          q.options,

          q.correct_answer,

          q.points,

          a.answer AS student_answer,

          CASE

              WHEN q.type = 'essay'

              THEN NULL

              WHEN LOWER(COALESCE(a.answer,'')) =
                   LOWER(COALESCE(q.correct_answer,''))

              THEN TRUE

              ELSE FALSE

          END AS is_correct

      FROM questions q

      LEFT JOIN answers a

      ON q.id = a.question_id

      AND a.attempt_id = $1

      WHERE q.quiz_id = (

          SELECT quiz_id

          FROM quiz_attempts

          WHERE id = $1

      )

      ORDER BY q.id ASC
      `,

      [attemptId]

    );

    res.json({

      attempt: {

        id: attempt.id,

        student: attempt.student_name,

        quiz: attempt.quiz_title,

        score,

        totalQuestions,

        percentage,

        passed: percentage >= 50,

        submitted: attempt.submitted,

        submitted_at: attempt.submitted_at,

        start_time: attempt.start_time,

        end_time: attempt.end_time

      },

      questions: questionsResult.rows

    });

  }

  catch (err) {

    console.error(err);

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
