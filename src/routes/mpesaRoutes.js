const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/callback", async (req, res) => {
  try {
    const body = req.body;

    const result = body.Body.stkCallback;

    const accountReference = result.AccountReference;
    const receipt = result.CallbackMetadata?.Item?.find(
      i => i.Name === "MpesaReceiptNumber"
    )?.Value;

    if (result.ResultCode === 0) {

      // extract purchase id
      const purchaseId = accountReference.replace("BOOK-", "");

      await pool.query(
        `UPDATE book_purchases
         SET status='paid', mpesa_receipt=$1
         WHERE id=$2`,
        [receipt, purchaseId]
      );

    }

    res.json({ received: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;