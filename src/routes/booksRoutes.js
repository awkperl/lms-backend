const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const booksController = require("../controllers/booksController");


// PUBLIC
router.get("/", booksController.getBooks);
router.get("/:id", booksController.getBookById);


// PROTECTED
router.post("/", auth, booksController.createBook);
router.post("/purchase", auth, booksController.purchaseBook);
router.get("/my/books", auth, booksController.myBooks);

module.exports = router;