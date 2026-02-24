const Wallet = require("../models/Wallet");
const Ledger = require("../models/Ledger");

// ================= CREDIT WALLET =================
exports.creditWallet = async (req, res) => {
  try {
    const { client_id, amount } = req.body;

    if (!client_id) {
      return res.status(400).json({ error: "client_id is required" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    const wallet = await Wallet.findOneAndUpdate(
      { clientId: client_id },
      { $inc: { balance: amount } },
      { new: true, upsert: true },
    );

    await Ledger.create({
      clientId: client_id,
      type: "CREDIT",
      amount,
      balanceAfter: wallet.balance,
    });

    return res.status(200).json({
      message: "Wallet credited successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ================= DEBIT WALLET =================
exports.debitWallet = async (req, res) => {
  try {
    const { client_id, amount } = req.body;

    if (!client_id) {
      return res.status(400).json({ error: "client_id is required" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    const wallet = await Wallet.findOne({ clientId: client_id });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

    await Ledger.create({
      clientId: client_id,
      type: "DEBIT",
      amount,
      balanceAfter: wallet.balance,
    });

    return res.status(200).json({
      message: "Wallet debited successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ================= GET BALANCE =================
exports.getBalance = async (req, res) => {
  try {
    const clientId = req.headers["client-id"];

    if (!clientId) {
      return res.status(400).json({ error: "client-id header is required" });
    }

    const wallet = await Wallet.findOne({ clientId });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.status(200).json({
      balance: wallet.balance,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
