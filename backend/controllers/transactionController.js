const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");

// Get user ID from JWT (or fallback to session if needed)
const getUserId = (req) => req.user?.id; // || req.session?.user?.id;

const getReceiptBucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "receipts",
  });

const toObjectId = (value) => {
  try {
    return new mongoose.Types.ObjectId(value);
  } catch (_) {
    return null;
  }
};

const uploadReceiptToGridFS = (file) =>
  new Promise((resolve, reject) => {
    const bucket = getReceiptBucket();
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        size: file.size,
      },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    Readable.from([file.buffer]).pipe(uploadStream);
  });

const deleteStoredReceipt = async (receipt) => {
  if (receipt?.fileId) {
    const objectId = toObjectId(receipt.fileId);
    if (objectId) {
      const bucket = getReceiptBucket();
      try {
        await bucket.delete(objectId);
      } catch (error) {
        if (error?.codeName !== "FileNotFound" && error?.code !== 26) {
          throw error;
        }
      }
      return;
    }
  }

  if (receipt?.path) {
    const filePath = path.join(__dirname, "..", receipt.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

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

    const receipts = await Promise.all(
      (req.files || []).map(async (file) => {
        const fileId = await uploadReceiptToGridFS(file);
        return {
          name: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          fileId,
        };
      })
    );

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

      const receiptsToRemove = transaction.receipts.filter((r) => {
        const idStr = r._id?.toString?.() || r._id;
        return idsToRemove.includes(idStr);
      });

      for (const receipt of receiptsToRemove) {
        await deleteStoredReceipt(receipt);
      }

      transaction.receipts = transaction.receipts.filter((r) => {
        const idStr = r._id?.toString?.() || r._id;
        return !idsToRemove.includes(idStr);
      });
    }

    if (req.files?.length) {
      const newReceipts = await Promise.all(
        req.files.map(async (file) => {
          const fileId = await uploadReceiptToGridFS(file);
          return {
            name: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            fileId,
          };
        })
      );
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

    for (const receipt of transaction.receipts) {
      await deleteStoredReceipt(receipt);
    }

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

    if (receipt.fileId) {
      const objectId = toObjectId(receipt.fileId);
      if (!objectId) {
        return res.status(404).json({ message: "File not found" });
      }

      const bucket = getReceiptBucket();
      res.setHeader(
        "Content-Type",
        receipt.mimeType || "application/octet-stream"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${receipt.name || "receipt"}"`
      );

      const downloadStream = bucket.openDownloadStream(objectId);
      downloadStream.on("error", () => {
        if (!res.headersSent) {
          res.status(404).json({ message: "File not found" });
        } else {
          res.destroy();
        }
      });
      return downloadStream.pipe(res);
    }

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
