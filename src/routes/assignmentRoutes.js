/**const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/assignmentController");

router.post("/", auth, c.create);
router.get("/:courseId", auth, c.getByCourse);

module.exports = router;**/
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const assignmentController = require("../controllers/assignmentController");

// Instructor only
router.post("/", auth, role(["instructor", "admin"]), assignmentController.createAssignment);

// Students + instructors
router.get("/:courseId", auth, assignmentController.getAssignmentsByCourse);

/**router.post(
  "/assignments",
  auth,
  role("instructor", "admin"),
  createAssignment
);

router.post(
  "/submissions",
  auth,
  role("student"),
  submitAssignment
);

router.get(
  "/submissions/:assignmentId",
  auth,
  role("instructor", "admin"),
  getSubmissions
);
**/
module.exports = router;
