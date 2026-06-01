const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const gradeController = require("../controllers/gradeController");

// Only instructors/admin can grade
router.post("/", auth, role(["instructor", "admin"]), gradeController.gradeSubmission);

// Students view their grades
router.get("/my-grades", auth, gradeController.getGradesForStudent);

module.exports = router;