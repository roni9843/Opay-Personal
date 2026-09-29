# 🚀 Opay-Personal System Architecture & Project Structure

## 📌 Project Overview
`Opay-personal` is an automated payment gateway platform designed to allow companies and users to automatically receive, parse, and verify mobile banking payments (bKash, Nagad, Rocket, Upay - Personal & Agent) via an Android Native App paired with a Node.js Express backend and React (Vite) frontend.

---

## 👥 Roles & Access Control

1. **Super Admin (Platform Owner)**:
   - Create and manage subscription packages (1 Month, 3 Months, 6 Months, 1 Year).
   - Set package limits (Maximum allowed devices, maximum allowed agents).
   - Manage Company accounts and manual subscription extensions.
   - Global system metrics and real-time logs.

2. **Company Owner (O-Pay Personal User / Business Owner)**:
   - Purchase and manage subscription plan.
   - Create **Agent** sub-accounts for staff.
   - Register and manage Android Devices.
   - Manage API Keys & Webhook Callbacks.
   - View business analytics, income reports & transaction logs.

3. **Agent (Hired Staff / Operator)**:
   - Log in via Android App or Web Panel.
   - Manage SIM numbers (bKash, Nagad, Rocket, Upay) assigned to their devices.
   - View real-time SMS feeds for assigned devices.

---

## 🗄️ Database Schemas (MongoDB Mongoose)

- **`User`**: Admin, Company Owner, and Agent accounts.
- **`SubscriptionPackage`**: Platform subscription plans defined by Super Admin.
- **`UserSubscription`**: Company owner's active subscription, API key, and Webhook URL.
- **`Device`**: Android device records (Secure Android ID, battery, network, FCM token).
- **`PaymentMethod`**: Mobile banking SIM numbers (bKash, Nagad, Rocket, Upay; personal or agent).
- **`PaymentMessage`**: Received payment SMS records (amount, sender, TrxID, full text).
- **`PaymentSession`**: Generated checkout links for customers (`/checkout/:sessionToken`).

---

## 📁 System Directory Structure

```
117-website/
├── project-structure/
│   └── PROJECT_STRUCTURE.md      <-- System architecture & reference notes
│
├── backend/
│   ├── config/
│   │   └── db.js                 <-- MongoDB Connection setup
│   ├── middleware/
│   │   ├── authMiddleware.js     <-- JWT validation
│   │   └── roleMiddleware.js     <-- Role restriction (super_admin, company_owner, agent)
│   ├── models/
│   │   ├── User.js
│   │   ├── SubscriptionPackage.js
│   │   ├── UserSubscription.js
│   │   ├── Device.js
│   │   ├── PaymentMethod.js
│   │   ├── PaymentMessage.js
│   │   └── PaymentSession.js
│   ├── routes/
│   │   ├── auth.js               <-- Login, Register, Profile
│   │   ├── superAdmin.js         <-- Packages, Company Management
│   │   ├── company.js            <-- Agents, Devices, API Key, Webhook
│   │   ├── agent.js              <-- Assigned Devices & Numbers
│   │   ├── devices.js            <-- Device activation & SMS receiver endpoint
│   │   └── external.js           <-- Checkout creation, resolve & TrxID verify
│   ├── socket/
│   │   └── socketHandler.js      <-- Real-time socket events & device presence
│   ├── utils/
│   │   ├── smsParser.js          <-- Regex parser for bKash, Nagad, Rocket, Upay
│   │   └── webhookSender.js      <-- Webhook retry engine
│   ├── .env                      <-- Environment variables & MONGODB_URI
│   ├── package.json
│   └── server.js                 <-- Express + Socket.IO entry point
│
└── mother-admin/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/           <-- Navbar, Sidebar, Modal, Cards
    │   │   ├── dashboard/        <-- Stats Widgets, Charts
    │   │   └── checkout/         <-- Payment options UI
    │   ├── context/
    │   │   ├── AuthContext.jsx   <-- User Auth state
    │   │   └── SocketContext.jsx <-- Real-time socket connection
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   └── Login.jsx
    │   │   ├── superAdmin/
    │   │   │   ├── Packages.jsx  <-- Create/edit subscription packages
    │   │   │   └── Companies.jsx <-- View all company owners
    │   │   ├── company/
    │   │   │   ├── Overview.jsx  <-- Main O-Pay Personal dashboard
    │   │   │   ├── Agents.jsx    <-- Create & manage agent accounts
    │   │   │   ├── Devices.jsx   <-- Register & view active devices
    │   │   │   ├── PaymentMethods.jsx <-- Manage bKash/Nagad SIMs
    │   │   │   ├── ApiSettings.jsx<-- API key & Webhook URL settings
    │   │   │   └── Transactions.jsx<-- View & search payment logs
    │   │   ├── agent/
    │   │   │   └── AgentDashboard.jsx
    │   │   └── checkout/
    │   │       └── PaymentPage.jsx <-- Customer payment gateway checkout UI
    │   ├── services/
    │   │   └── api.js            <-- Axios HTTP client
    │   ├── App.jsx
    │   ├── index.css             <-- Modern Glassmorphism CSS design system
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚡ API Specifications

### 1. Developer Checkout Creation API
```http
POST /api/external/checkout/create
Header: X-API-Key: <company_api_key>
Content-Type: application/json

{
  "amount": 500,
  "customerRef": "USER_9988",
  "callbackUrl": "https://opay-personal.com/api/payment-callback"
}
```

### 2. Webhook Callback Payload
```json
{
  "event": "payment.success",
  "sessionToken": "SESS_8837192",
  "customerRef": "USER_9988",
  "amount": 500,
  "trxID": "BKH9837261",
  "provider": "bkash",
  "senderNumber": "017******89",
  "timestamp": "2026-09-25T21:57:00.000Z"
}
```

---

## 📱 Native Java Android App Specs (`OpayApp`)

- **Package**: `com.opay.personal`
- **Features**:
  - `LoginActivity`: Company Owner and Agent login.
  - `PersistentService`: Android Foreground service ensuring 24/7 background operation.
  - `SmsReceiver`: Real-time interceptor for incoming SMS (`android.provider.Telephony.SMS_RECEIVED`).
  - `SocketManager`: WebSocket listener for heartbeat and live telemetry (battery level, network type).
  - `Room Database`: Local queue for SMS backup when offline.
