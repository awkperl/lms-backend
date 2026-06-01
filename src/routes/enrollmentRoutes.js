const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const enrollmentController = require("../controllers/enrollmentController");

router.post("/", auth, enrollmentController.enroll);
router.get("/my-courses", auth, enrollmentController.getMyCourses);

module.exports = router;