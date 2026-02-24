const mongoose = require("mongoose");
const axios = require("axios");

const Wallet = require("../models/Wallet");
const Order = require("../models/Order");

// ================= CREATE ORDER (WITH TRANSACTION) =================
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const clientId = req.headers["client-id"];
    const { amount } = req.body;

    if (!clientId) {
      throw new Error("client-id header is required");
    }

    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    const wallet = await Wallet.findOne({ clientId }).session(session);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Deduct wallet balance
    wallet.balance -= amount;
    await wallet.save({ session });

    // Create order inside transaction
    const orderDocs = await Order.create(
      [
        {
          clientId,
          amount,
          status: "PENDING",
        },
      ],
      { session },
    );

    const order = orderDocs[0];

    await session.commitTransaction();
    session.endSession();

    // Fulfillment API call AFTER transaction commit
    try {
      const response = await axios.post(
        "https://jsonplaceholder.typicode.com/posts",
        {
          userId: clientId,
          title: order._id.toString(),
        },
      );

      order.fulfillmentId = response.data.id;
      order.status = "FULFILLED";
      await order.save();
    } catch (apiError) {
      order.status = "FAILED";
      await order.save();
    }

    return res.status(201).json({
      order_id: order._id,
      status: order.status,
      fulfillmentId: order.fulfillmentId,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET ORDER =================
exports.getOrder = async (req, res) => {
  try {
    const clientId = req.headers["client-id"];

    if (!clientId) {
      return res.status(400).json({ error: "client-id header is required" });
    }

    const order = await Order.findOne({
      _id: req.params.order_id,
      clientId,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
