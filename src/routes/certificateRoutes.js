const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const certificateController = require("../controllers/certificateController");

router.get(

    "/course/:courseId",

    auth,

    certificateController.getCourseStudents

);

router.post(

    "/generate",

    auth,

    certificateController.generateCertificate

);

module.exports = router;