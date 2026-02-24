# Wallet Transaction & Order System

## 📌 Project Overview

This project implements a backend-only wallet and transaction system
where:

-   Each client has an associated wallet.
-   Admins can credit or debit wallet balances.
-   Clients can create orders using their wallet balance.
-   Order creation deducts the wallet balance atomically using MongoDB
    transactions.
-   After order creation, a fulfillment API is called and the returned
    fulfillment ID is stored with the order.

The system ensures atomic wallet integrity, concurrency safety, and
reliable order processing.

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Node.js
-   Express.js
-   MongoDB (Replica Set Enabled)
-   Mongoose
-   Axios

------------------------------------------------------------------------

## 🧱 Design Decisions

Wallet deduction and order creation are executed inside a MongoDB
transaction to guarantee atomicity and prevent race conditions during
concurrent requests. The fulfillment API call is executed after the
transaction commit to avoid long-running database locks. Ledger entries
are created for all wallet credit and debit operations to maintain an
audit trail. The system is intentionally backend-only and minimal,
focusing strictly on assignment requirements without overengineering.

------------------------------------------------------------------------

## 📂 API Endpoints

### 1️⃣ Admin -- Credit Wallet

POST /admin/wallet/credit

Body: { "client_id": "client1", "amount": 1000 }

------------------------------------------------------------------------

### 2️⃣ Admin -- Debit Wallet

POST /admin/wallet/debit

Body: { "client_id": "client1", "amount": 200 }

------------------------------------------------------------------------

### 3️⃣ Create Order (Client)

POST /orders

Headers: client-id: client1

Body: { "amount": 300 }

Response: { "order_id": "ORDER_ID", "status": "FULFILLED",
"fulfillmentId": "101" }

------------------------------------------------------------------------

### 4️⃣ Get Order Details

GET /orders/:order_id

Headers: client-id: client1

------------------------------------------------------------------------

### 5️⃣ Get Wallet Balance

GET /wallet/balance

Headers: client-id: client1

------------------------------------------------------------------------

## ⚙️ Setup Instructions

1️⃣ Install Dependencies

    npm install

2️⃣ Ensure MongoDB Replica Set is Enabled

    mongosh
    rs.initiate()
    rs.status()

State must be "PRIMARY".

3️⃣ Run Application

    node index.js

Server runs on:

    http://localhost:3000

------------------------------------------------------------------------

## 🧪 Example Curl Commands

Credit Wallet:

    curl -X POST http://localhost:3000/admin/wallet/credit     -H "Content-Type: application/json"     -d "{"client_id":"client1","amount":1000}"

Create Order:

    curl -X POST http://localhost:3000/orders     -H "Content-Type: application/json"     -H "client-id: client1"     -d "{"amount":300}"

Get Balance:

    curl http://localhost:3000/wallet/balance     -H "client-id: client1"

------------------------------------------------------------------------

## 🔐 Concurrency & Reliability

-   Wallet deduction and order creation use MongoDB transactions.
-   Prevents race conditions during concurrent order requests.
-   Wallet balance cannot go negative.
-   Fulfillment failures are handled gracefully and order status is
    updated accordingly.

------------------------------------------------------------------------

## 📎 Evaluation Criteria Coverage

✔ Completeness -- All required APIs implemented\
✔ Correctness -- Proper validation and HTTP status codes\
✔ Scalability -- Transaction-safe wallet deduction\
✔ Reliability -- Error handling and fulfillment fallback
