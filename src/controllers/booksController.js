const pool = require("../config/db");
const { createNotification } = require("../services/notificationService");
const mpesa = require("../services/mpesaService");


// ==============================
// CREATE BOOK (INSTRUCTOR)
// ==============================
exports.createBook = async (req, res) => {
  try {
    const instructor_id = req.user.id;
    const { title, blurb, price, cover_url, file_url } = req.body;

    const result = await pool.query(
      `INSERT INTO books (instructor_id, title, blurb, price, cover_url, file_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [instructor_id, title, blurb, price, cover_url, file_url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// GET ALL BOOKS (PUBLIC)
// ==============================
exports.getBooks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as instructor_name
       FROM books b
       LEFT JOIN users u ON b.instructor_id = u.id
       ORDER BY b.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// GET SINGLE BOOK
// ==============================
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT b.*, u.name as instructor_name
       FROM books b
       LEFT JOIN users u ON b.instructor_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ msg: "Book not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// PURCHASE BOOK (CREATE ORDER)
// ==============================
/**exports.purchaseBook = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { book_id } = req.body;

    // get book
    const bookRes = await pool.query(
      `SELECT * FROM books WHERE id=$1`,
      [book_id]
    );

    const book = bookRes.rows[0];

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    // check if already purchased
    const existing = await pool.query(
      `SELECT * FROM book_purchases
       WHERE book_id=$1 AND user_id=$2 AND status='paid'`,
      [book_id, user_id]
    );

    if (existing.rows.length > 0) {
      return res.json({ msg: "Already purchased" });
    }

    // create purchase record
    const purchase = await pool.query(
      `INSERT INTO book_purchases (book_id, user_id, amount, status)
       VALUES ($1,$2,$3,'pending')
       RETURNING *`,
      [book_id, user_id, book.price]
    );

    res.json({
      msg: "Purchase initiated",
      purchase: purchase.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
**/
exports.purchaseBook = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { book_id, phone } = req.body;

    const bookRes = await pool.query(
      "SELECT * FROM books WHERE id=$1",
      [book_id]
    );

    const book = bookRes.rows[0];

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    // create pending order
    const order = await pool.query(
      `INSERT INTO book_purchases (book_id, user_id, amount, status)
       VALUES ($1,$2,$3,'pending')
       RETURNING *`,
      [book_id, user_id, book.price]
    );

    const purchase = order.rows[0];

    // convert phone (07xx → 2547xx)
    const formattedPhone = phone.startsWith("0")
      ? "254" + phone.substring(1)
      : phone;

    // STK PUSH
    const stk = await mpesa.stkPush({
      phone: formattedPhone,
      amount: book.price,
      accountReference: `BOOK-${purchase.id}`
    });

    res.json({
      msg: "STK push sent",
      stk,
      purchase
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ==============================
// GET MY BOOKS (PURCHASED)
// ==============================
exports.myBooks = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT b.*, p.status, p.mpesa_receipt
       FROM books b
       JOIN book_purchases p ON b.id = p.book_id
       WHERE p.user_id = $1 AND p.status = 'paid'
       ORDER BY p.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};