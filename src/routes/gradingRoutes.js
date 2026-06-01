/**const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  gradeSubmission,
  getSubmission
} = require("../controllers/gradingController");

// Instructor grading
router.post(
  "/grade",
  auth,
  role("instructor", "admin"),
  gradeSubmission
);

// View submission (student or instructor)
router.get(
  "/submission/:submissionId",
  auth,
  getSubmission
);

module.exports = router;**/
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  gradeSubmission,
  getSubmission
} = require("../controllers/gradingController");

// Instructor grading
router.post(
  "/grade",
  auth,
  role("instructor", "admin"),
  gradeSubmission
);

// View submission (student or instructor)
router.get(
  "/submission/:submissionId",
  auth,
  getSubmission
);

module.exports = router;