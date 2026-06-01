/**const router = require("express").Router();
const c = require("../controllers/authController");
router.post("/register", c.register);
router.post("/login", c.login);
module.exports = router;
**/
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;