const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth = require("../middleware/auth");

router.post("/", auth, upload.single("file"), (req, res) => {
  res.json({
    file_url: `http://localhost:5000/uploads/${req.file.filename}`
  });
});

module.exports = router;