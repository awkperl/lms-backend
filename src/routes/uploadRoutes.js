/**const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth = require("../middleware/auth");

router.post("/", auth, upload.single("file"), (req, res) => {
  res.json({
    //file_url: `http://localhost:5000/uploads/${req.file.filename}`
     file_url: req.file.path
  });
});

module.exports = router;**/
const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth = require("../middleware/auth");

router.post("/", auth, (req, res) => {

  upload.single("file")(req, res, (err) => {

    if (err) {
      console.error("UPLOAD ERROR:");
      console.error(err);
      console.error(err.message);

      return res.status(500).json({
        error: err.message
      });
    }

    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded"
      });
    }

    res.json({
      file_url: req.file.path
    });

  });

});

module.exports = router;
