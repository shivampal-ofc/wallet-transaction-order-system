const express = require("express");
const mongoose = require("mongoose");

const walletController = require("./src/controllers/walletController");
const orderController = require("./src/controllers/orderController");

const app = express();
app.use(express.json());

// ---- MongoDB Connection ----
mongoose
  .connect("mongodb://127.0.0.1:27017/wallet-system")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });

// ---- Routes ----
app.post("/admin/wallet/credit", walletController.creditWallet);
app.post("/admin/wallet/debit", walletController.debitWallet);

app.post("/orders", orderController.createOrder);
app.get("/orders/:order_id", orderController.getOrder);

app.get("/wallet/balance", walletController.getBalance);
