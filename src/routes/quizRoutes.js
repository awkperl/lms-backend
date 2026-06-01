/**const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const quizController = require("../controllers/quizController");

// Start quiz
router.post("/start", auth, quizController.startQuiz);

// Save answer
router.post("/answer", auth, quizController.saveAnswer);

// Submit quiz
router.post("/submit", auth, quizController.submitQuiz);

module.exports = router;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const quizController = require("../controllers/quizController");

// GET ALL QUIZZES
router.get(
  "/",
  auth,
  quizController.getQuizzes
);

// START QUIZ
router.post(
  "/start",
  auth,
  quizController.startQuiz
);

// SAVE ANSWER
router.post(
  "/answer",
  auth,
  quizController.saveAnswer
);

// SUBMIT QUIZ
router.post(
  "/submit",
  auth,
  quizController.submitQuiz
);

module.exports = router;**/
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const quizController = require("../controllers/quizController");

// GET QUIZZES
router.get("/", auth, quizController.getQuizzes);

// GET QUESTIONS
router.get(
  "/:quizId/questions",
  auth,
  quizController.getQuizQuestions
);
router.post(
  "/question",
  auth,
  quizController.createQuestion
);

// START QUIZ
router.post(
  "/start",
  auth,
  quizController.startQuiz
);

// SAVE ANSWER
router.post(
  "/answer",
  auth,
  quizController.saveAnswer
);

// SUBMIT QUIZ
router.post(
  "/submit",
  auth,
  quizController.submitQuiz
);

module.exports = router;