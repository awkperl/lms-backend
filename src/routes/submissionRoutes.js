/**const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionController");

router.post("/", submissionController.create);
router.get("/:assignmentId", submissionController.getByAssignment);

module.exports = router;**/

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const submissionController = require("../controllers/submissionController");

// Submit assignment
router.post("/", auth, submissionController.submitAssignment);

// View submissions
router.get("/:assignmentId", auth, submissionController.getSubmissions);

module.exports = router;

/**const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  submitAssignment,
  getSubmissions
} = require("../controllers/submissionController");

// STUDENT SUBMIT ASSIGNMENT
router.post(
  "/",
  auth,
  submitAssignment
);

// INSTRUCTOR VIEW SUBMISSIONS
router.get(
  "/:assignmentId",
  auth,
  getSubmissions
);

module.exports = router;**/

/**const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  submitAssignment,
  getSubmissions
} = require("../controllers/submissionController");

// CREATE SUBMISSION
router.post(
  "/",
  auth,
  submitAssignment
);

// GET SUBMISSIONS BY ASSIGNMENT
router.get(
  "/:assignmentId",
  auth,
  getSubmissions
);

module.exports = router;**/