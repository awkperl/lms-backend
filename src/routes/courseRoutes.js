/**const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/courseController");

router.post("/", auth, c.create);
router.get("/", auth, c.getAll);

module.exports = router;
**/
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const courseController = require("../controllers/courseController");

// Only instructors can create courses
router.post("/", auth, role(["instructor", "admin"]), courseController.createCourse);

// Anyone logged in can view courses
router.get("/", auth, courseController.getCourses);
router.get(
  "/all",
  auth,
  courseController.getAllCourses
);

module.exports = router;