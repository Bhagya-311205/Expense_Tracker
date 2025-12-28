const express = require("express");
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  downloadReceipt,
} = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authmiddleware");

const upload = require("../middleware/upload");
const router = express.Router();

router.use(authMiddleware);

router.get("/all", getTransactions);
router.get("/summary", getTransactionSummary);

router.get("/:id", getTransaction);

router.post("/create", upload.array("receipts"), createTransaction);

router.put("/update/:id", upload.array("receipts"), updateTransaction);

router.delete("/delete/:id", deleteTransaction);

router.get("/:id/receipt/:receiptId", downloadReceipt);

module.exports = router;
