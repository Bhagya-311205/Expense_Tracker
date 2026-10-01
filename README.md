# TrackEx - Expense Tracker

**TrackEx** is a full-stack personal finance management application designed to help users track, organize, and analyze their income and expenses through an intuitive dashboard.

The application provides secure authentication, OTP-based email verification, transaction management, financial summaries, category-wise analytics, and receipt management.

---

## Features

### Authentication & Security
- User registration with email OTP verification
- Secure login using email and password
- OTP-based login verification
- OTP expiry and resend functionality
- Password hashing using bcrypt
- JWT-based authentication
- JWT stored in HTTP-only cookies
- Protected transaction routes
- User-specific transaction access control

### Transaction Management
- Add income and expense transactions
- Categorize transactions
- Record merchant and transaction subject
- Add transaction descriptions
- Specify transaction date and amount
- Distinguish between Credit and Debit transactions
- Edit and delete transactions
- View individual transaction details
- Input validation for transaction type and amount

### Financial Dashboard
- Total income
- Total expenses
- Current balance
- Total number of transactions
- Category-wise spending breakdown
- Transaction counts by category
- Interactive charts and financial analytics

### Receipt Management
- Upload receipts while creating transactions
- Attach multiple receipts to a transaction
- Store receipts using MongoDB GridFS
- Download stored receipts
- Remove individual receipts while editing transactions
- Automatically remove stored receipt files when transactions are deleted

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | User interface |
| **Vite** | Frontend build tool |
| **React Router** | Client-side routing |
| **Material UI** | UI components |
| **MUI X Data Grid** | Transaction tables |
| **MUI X Charts** | Financial visualization |
| **Tailwind CSS** | Styling |
| **Axios** | REST API communication |
| **Sonner** | Notifications |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Server-side runtime |
| **Express.js** | REST API framework |
| **MongoDB Atlas** | Cloud database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **MongoDB GridFS** | Receipt storage |
| **Google Gmail API** | OTP email delivery |
| **Google OAuth 2.0** | Gmail API authorization |
| **CORS** | Cross-origin API access |
| **dotenv** | Environment configuration |

---

## System Architecture

```text
                         ┌──────────────────────┐
                         │      React UI        │
                         │   Vite + MUI +       │
                         │     Tailwind CSS     │
                         └──────────┬───────────┘
                                    │
                              Axios / REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express Backend    │
                         │      Node.js         │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌────────────┐        ┌─────────────┐       ┌─────────────┐
       │ JWT Auth   │        │  MongoDB     │       │ Gmail API   │
       │ Middleware │        │   Atlas      │       │   OAuth 2.0 │
       └────────────┘        └──────┬──────┘       └──────┬──────┘
                                    │                     │
                                    ▼                     ▼
                             ┌─────────────┐       ┌─────────────┐
                             │   GridFS    │       │ OTP Emails  │
                             │   Receipts  │       │   to Users  │
                             └─────────────┘       └─────────────┘
```

---

## Authentication Flow

### Registration

```text
User enters registration details
            ↓
Account created
            ↓
6-digit OTP generated
            ↓
Gmail API sends OTP
            ↓
User verifies OTP
            ↓
JWT generated
            ↓
JWT stored in HTTP-only cookie
```

### Login

```text
Email + Password
       ↓
Password verification
       ↓
6-digit OTP generated
       ↓
Gmail API sends OTP
       ↓
User verifies OTP
       ↓
JWT authentication cookie
       ↓
Authenticated session
```

OTP codes expire after 1 minute.

The current JWT configuration has a 7-day expiration period.

---

## Email Delivery

The application initially used **Nodemailer with Gmail SMTP** for sending OTP emails. However, while deploying the backend on **Render**, SMTP-based email delivery was not reliable because Render restricts outbound SMTP traffic on its free web services.

To resolve this deployment limitation, the application was migrated to the **Google Gmail API** using OAuth 2.0.

### Email Flow

```text
User Signup / Login
        ↓
OTP Generated
        ↓
Express Backend
        ↓
Google OAuth 2.0
        ↓
Gmail API over HTTPS
        ↓
OTP delivered to user's email
```

The Gmail API uses the following OAuth scope:

```text
https://www.googleapis.com/auth/gmail.send
```

This approach eliminates the application's dependency on SMTP ports while allowing OTP emails to be sent through the configured Gmail account.

The previous Nodemailer implementation has been retained in the codebase as commented-out code for reference.

---

## Transaction Flow

```text
User creates transaction
          ↓
Authentication middleware
          ↓
Transaction validation
          ↓
Receipt processing (if provided)
          ↓
Receipt → MongoDB GridFS
          ↓
Transaction → MongoDB
          ↓
Dashboard / Analytics updated
```

Every transaction is associated with the authenticated user's ID, ensuring users can only access and modify their own financial records.

---

## Financial Analytics

The dashboard provides:

- Total Income
- Total Expenses
- Current Balance
- Total Transactions
- Category-wise spending
- Transaction counts by category

The balance is calculated as:

```text
Balance = Total Income - Total Expenses
```

---

## Receipt Management

Receipts are stored using **MongoDB GridFS**, allowing files to remain persistent even when the backend is deployed on cloud infrastructure.

### Receipt Upload Flow

```text
Receipt Selected
      ↓
Multipart Request
      ↓
Multer Processing
      ↓
GridFS Upload
      ↓
MongoDB Storage
      ↓
Receipt ID Linked to Transaction
```

---

## Project Structure

```text
Expense_Tracker/
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── email.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── transactionController.js
│   │
│   ├── middleware/
│   │   └── jwtAuthMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── transactionRoutes.js
│   │
│   ├── scripts/
│   │   └── generateGmailToken.js
│   │
│   ├── app.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# Getting Started

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account
- Google account
- Google Cloud project with Gmail API enabled

---

## 1. Clone the Repository

```bash
git clone https://github.com/Bhagya-311205/Expense_Tracker.git
cd Expense_Tracker
```

---

## 2. Install Dependencies

### Backend

```bash
cd backend
npm install
```

Install Gmail API dependencies:

```bash
npm install googleapis @google-cloud/local-auth
```

### Frontend

```bash
cd ../frontend
npm install
```

---

## 3. Configure Google Gmail API

Create a project in the [Google Cloud Console](https://console.cloud.google.com/).

Enable:

```text
Gmail API
```

Configure Google Auth Platform and create OAuth credentials.

Add the following scope:

```text
https://www.googleapis.com/auth/gmail.send
```

The Gmail API is used only by the backend to send OTP emails. Gmail API credentials are never exposed to the frontend.

---

## 4. Environment Variables

### Backend

Create:

```text
backend/.env.development
```

Example:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173

GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret
GMAIL_REFRESH_TOKEN=your_google_refresh_token
GMAIL_USER=your_gmail_address
```

For production, use `.env.production` locally or configure the same variables directly through the hosting platform.

### Frontend

Example:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 5. Generate Gmail Refresh Token

Place the downloaded Google OAuth credentials in:

```text
backend/scripts/gmail-credentials.json
```

Run:

```bash
node scripts/generateGmailToken.js
```

Complete the Google authorization flow and copy the generated refresh token into:

```env
GMAIL_REFRESH_TOKEN=your_refresh_token
```

The credential file and refresh token must never be committed to GitHub.

---

## 6. Start the Backend

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

---

## 7. Start the Frontend

```bash
cd frontend
npm run dev
```

---

# Deployment

## Frontend — Vercel

Recommended configuration:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Configure:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Backend — Render

Recommended configuration:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Configure the following environment variables in Render:

```env
NODE_ENV=production

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret

FRONTEND_URL=https://your-frontend.vercel.app

GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret
GMAIL_REFRESH_TOKEN=your_google_refresh_token
GMAIL_USER=your_gmail_address
```

The backend communicates with Gmail through the Gmail API over HTTPS, so it does not depend on direct SMTP connections.

---

# API Overview

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/verify-otp` | Verify OTP |
| `POST` | `/api/auth/resend-otp` | Resend OTP |
| `POST` | `/api/auth/login` | Initiate login |
| `POST` | `/api/auth/logout` | Logout user |
| `GET` | `/api/auth/me` | Get authenticated user |

## Transactions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | Get user's transactions |
| `GET` | `/api/transactions/:id` | Get a transaction |
| `POST` | `/api/transactions` | Create transaction |
| `PUT` | `/api/transactions/:id` | Update transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction |
| `GET` | `/api/transactions/summary` | Get financial summary |
| `GET` | `/api/transactions/:id/receipts/:receiptId` | Download receipt |

---

# Key Engineering Highlights

### Secure Authentication
Implemented JWT-based authentication with HTTP-only cookies, password hashing, OTP verification, and protected API routes.

### Gmail API Integration
Migrated OTP email delivery from **Nodemailer/Gmail SMTP to the Google Gmail API using OAuth 2.0**, eliminating dependency on SMTP ports and enabling email delivery from the Render deployment.

### Receipt Storage
Implemented MongoDB GridFS for persistent receipt storage instead of relying on local server storage.

### User-Level Authorization
Implemented ownership checks to ensure users can only access, update, and delete their own transactions and receipts.

### Modular Backend
Separated routes, controllers, models, middleware, database configuration, and email configuration for maintainability and easier future development.

---

# Security

- Passwords are hashed using bcrypt.
- Authentication tokens are stored in HTTP-only cookies.
- Production cookies use secure settings.
- CORS is configured for the deployed frontend.
- Transaction ownership is validated before database operations.
- Receipt downloads require authentication.
- Gmail API credentials remain exclusively on the backend.
- OAuth refresh tokens are stored through environment variables.
- Environment files and Google credential files are excluded from version control.

---

# Environment File Structure

The project uses separate environment configurations for development and production:

```text
.env.development
.env.production
.env.example
```

Only `.env.example` should be committed to GitHub.

Example:

```env
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=

GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_USER=
```

---

# Live Application

**Frontend:** https://trackex-beta.vercel.app/

**GitHub:** https://github.com/Bhagya-311205/Expense_Tracker

---

# Author

**Bhagya Agrawal**

GitHub: https://github.com/Bhagya-311205