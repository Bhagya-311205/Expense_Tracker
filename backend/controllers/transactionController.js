const Transaction = require("../models/Transaction");
const path = require("path");
const fs = require("fs");

// Get user ID from JWT (or fallback to session if needed)
const getUserId = (req) => req.user?.id; // || req.session?.user?.id;

const findOwnedTransaction = async (id, userId) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    return { error: { status: 404, message: "Transaction not found" } };
  }
  if (transaction.userId.toString() !== userId) {
    return { error: { status: 403, message: "Unauthorized" } };
  }
  return { transaction };
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { transaction, error } = await findOwnedTransaction(id, userId);

    if (error) return res.status(error.status).json({ message: error.message });

    res.json(transaction);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transaction", error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { subject, merchant, amount, type, date, category, description } =
      req.body;

    if (!subject || !merchant || !amount || !type || !date || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!["debit", "credit"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const receipts = (req.files || []).map((file) => ({
      name: file.originalname,
      size: file.size,
      path: `uploads/${file.filename}`,
    }));

    const transaction = new Transaction({
      userId,
      subject,
      merchant,
      amount: parseFloat(amount),
      type,
      date: new Date(date),
      category,
      description: description || "",
      receipts: receipts,
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating transaction", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { transaction, error } = await findOwnedTransaction(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const {
      subject,
      merchant,
      amount,
      type,
      date,
      category,
      description,
      removeReceipts,
      removedReceipts,
    } = req.body;

    if (amount && amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (type && !["debit", "credit"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (subject) transaction.subject = subject;
    if (merchant) transaction.merchant = merchant;
    if (amount) transaction.amount = parseFloat(amount);
    if (type) transaction.type = type;
    if (date) transaction.date = new Date(date);
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;

    const removeField = removedReceipts ?? removeReceipts;
    if (removeField) {
      let idsToRemove = removeField;
      if (typeof idsToRemove === "string") {
        try {
          idsToRemove = JSON.parse(idsToRemove);
        } catch (_) {
          idsToRemove = [removeField];
        }
      }
      if (!Array.isArray(idsToRemove)) idsToRemove = [idsToRemove];

      transaction.receipts = transaction.receipts.filter((r) => {
        const idStr = r._id?.toString?.() || r._id;
        if (idsToRemove.includes(idStr)) {
          const filePath = path.join(__dirname, "..", r.path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return false;
        }
        return true;
      });
    }

    if (req.files?.length) {
      const newReceipts = req.files.map((file) => ({
        name: file.originalname,
        path: `uploads/${file.filename}`,
        size: file.size,
      }));
      transaction.receipts.push(...newReceipts);
    }

    await transaction.save();

    res.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating transaction",
      error: error.message,
    });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { transaction, error } = await findOwnedTransaction(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    transaction.receipts.forEach((r) => {
      const filePath = path.join(__dirname, "..", r.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Transaction.findByIdAndDelete(id);

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting transaction",
      error: error.message,
    });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const transactions = await Transaction.find({ userId });

    const totalIncome = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const categoryBreakdown = {};
    transactions.forEach((t) => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { total: 0, count: 0, type: t.type };
      }
      categoryBreakdown[t.category].total += t.amount;
      categoryBreakdown[t.category].count += 1;
    });

    res.json({
      totalIncome,
      totalExpenses,
      balance,
      totalTransactions: transactions.length,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching summary",
      error: error.message,
    });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id, receiptId } = req.params;
    const { transaction, error } = await findOwnedTransaction(id, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const receipt = transaction.receipts.find(
      (r) => r._id?.toString?.() === receiptId || r._id === receiptId
    );
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    const filePath = path.join(__dirname, "..", receipt.path || "");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath, receipt.name || "receipt");
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error downloading receipt", error: err.message });
  }
};
