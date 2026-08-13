#  TrackEx — Expense Tracker

**TrackEx** is a full-stack personal finance management application designed to help users record, organize, and analyze their income and expenses through a centralized dashboard.

The application provides secure user authentication, transaction management, financial summaries, category-wise analytics, and receipt management. It is built with **React, Node.js, Express, MongoDB, and JWT-based authentication**, with separate frontend and backend deployments.

##  Live Demo

**Live Application:** [https://trackex-beta.vercel.app/](https://trackex-beta.vercel.app/)

**Repository:** [https://github.com/Bhagya-311205/Expense\_Tracker](https://github.com/Bhagya-311205/Expense_Tracker)

---

##  Features

###  Authentication & Security

- User registration with **email OTP verification**
- Secure login using email and password
- OTP-based login verification
- OTP expiry and resend functionality
- Password hashing using **bcrypt**
- Stateless authentication using **JWT**
- JWT stored in **HTTP-only cookies**
- Protected transaction routes
- User-specific transaction access control
- CORS configuration for frontend-backend communication
- Secure production cookie configuration

###  Transaction Management

- Add income and expense transactions
- Categorize transactions
- Record merchant and transaction subject
- Add transaction descriptions
- Specify transaction date and amount
- Distinguish between **Credit** and **Debit** transactions
- Edit existing transactions
- Delete transactions
- View individual transaction details
- Automatic validation for transaction type and amount

###  Financial Dashboard

The application provides an overview of financial activity through:

- Total income
- Total expenses
- Current balance
- Total number of transactions
- Category-wise spending breakdown
- Transaction counts by category
- Interactive charts and data visualization

This enables users to quickly understand their spending patterns and overall financial position.

###  Receipt Management

- Upload receipts while creating transactions
- Attach multiple receipts to a transaction
- Store receipt files using **MongoDB GridFS**
- Preserve receipt metadata such as filename, MIME type, and size
- Download stored receipts
- Remove individual receipts while editing transactions
- Automatically remove stored receipt files when transactions are deleted

Using GridFS keeps receipt storage within the MongoDB infrastructure and avoids dependency on local server storage or third-party file-storage services.

---

## ️ System Architecture

```
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
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
           ┌────────────┐    ┌─────────────┐   ┌─────────────┐
           │ JWT Auth   │    │ MongoDB     │   │ Nodemailer  │
           │ Middleware │    │ Atlas       │   │ OTP Email   │
           └────────────┘    └──────┬──────┘   └─────────────┘
                                    │
                                    ▼
                             ┌─────────────┐
                             │   GridFS    │
                             │   Receipts  │
                             └─────────────┘

```

---

## ️ Tech Stack

### Frontend

| TechnologyPurpose   |                                |
| ------------------- | ------------------------------ |
| **React 19**        | User interface                 |
| **Vite**            | Frontend build tool            |
| **React Router**    | Client-side routing            |
| **Material UI**     | UI components                  |
| **MUI X Data Grid** | Transaction data tables        |
| **MUI X Charts**    | Financial visualization        |
| **Tailwind CSS**    | Styling and responsive layouts |
| **Axios**           | REST API communication         |
| **Sonner**          | User notifications             |

The frontend dependencies and build configuration are defined in `frontend/package.json`.

### Backend

| TechnologyPurpose  |                                |
| ------------------ | ------------------------------ |
| **Node.js**        | Server-side runtime            |
| **Express.js**     | REST API framework             |
| **MongoDB Atlas**  | Cloud database                 |
| **Mongoose**       | MongoDB ODM                    |
| **JWT**            | Authentication                 |
| **bcrypt**         | Password hashing               |
| **Multer**         | Multipart/file upload handling |
| **MongoDB GridFS** | Receipt storage                |
| **Nodemailer**     | OTP email delivery             |
| **CORS**           | Cross-origin API access        |
| **dotenv**         | Environment configuration      |

The backend is organized into controllers, routes, middleware, models, and configuration modules.

---

##  Authentication Flow

TrackEx uses a two-step authentication process.

### Registration

```
User enters details
        ↓
Account created
        ↓
6-digit OTP generated
        ↓
OTP sent through email
        ↓
User verifies OTP
        ↓
Account verified
        ↓
JWT generated
        ↓
JWT stored in HTTP-only cookie

```

### Login

```
Email + Password
       ↓
Password verification
       ↓
6-digit OTP generated
       ↓
OTP sent to registered email
       ↓
OTP verification
       ↓
JWT authentication cookie
       ↓
Authenticated session

```

OTP codes are generated securely and expire after **1 minute**. Authentication tokens are configured using HTTP-only cookies, with secure cross-site settings enabled for production deployments.

---

##  Transaction Flow

```
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

Every transaction is associated with the authenticated user's ID, ensuring that users can only access and modify their own financial records.

---

##  Financial Analytics

The backend calculates key financial indicators directly from the user's transactions:

- **Total Income** = Sum of all credit transactions
- **Total Expenses** = Sum of all debit transactions
- **Balance** = Total Income − Total Expenses
- **Total Transactions**
- **Category Breakdown** = Spending grouped by category

These aggregated metrics are exposed through the transaction summary API and consumed by the frontend dashboard.

---

##  Project Structure

```
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
├── .gitignore
├── package.json
└── README.md

```

---

##  Getting Started

### Prerequisites

Make sure the following are installed:

- **Node.js** 18+
- **npm**
- **MongoDB Atlas account**
- An email account capable of sending OTP emails

---

### 1. Clone the Repository

```
git clone https://github.com/Bhagya-311205/Expense_Tracker.git
cd Expense_Tracker

```

---

### 2. Configure the Backend

```
cd backend
npm install

```

Create the required environment configuration.

Example:

```
NODE_ENV=development
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_strong_jwt_secret

FRONTEND_URL=http://localhost:5173

EMAIL_USER=your_email
EMAIL_PASS=your_email_password_or_app_password

```

For production, configure the appropriate frontend URL and authentication settings.

---

### 3. Start the Backend

```
npm run dev

```

The backend will run on:

```
http://localhost:3000

```

A health-check endpoint is available at:

```
/api/health

```

The backend exposes authentication and transaction APIs under:

```
/api/auth
/api/transactions

```

The Express application configures CORS, JSON parsing, authentication routes, transaction routes, and health checks.

---

### 4. Configure the Frontend

Open another terminal:

```
cd frontend
npm install

```

Create a frontend environment file:

```
VITE_API_URL=http://localhost:3000/api

```

Start the development server:

```
npm run dev

```

The frontend uses Vite and exposes development, production build, linting, and preview scripts.

---

##  Deployment

The project is structured for independent frontend and backend deployment.

### Frontend — Vercel

The frontend can be deployed on **Vercel** with:

```
Root Directory: frontend
Build Command: npm run build
Output Directory: dist

```

Set:

```
VITE_API_URL=https://your-backend.onrender.com/api

```

### Backend — Render

The backend can be deployed on **Render** with:

```
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check: /api/health

```

Configure:

```
NODE_ENV=production
MONGODB_URI=your_atlas_connection_string
JWT_SECRET=your_strong_secret
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_USER=your_email
EMAIL_PASS=your_email_password_or_app_password

```

The repository is already structured around a Vercel frontend, Render backend, and MongoDB Atlas database.

---

## ️ MongoDB Atlas & GridFS

MongoDB Atlas is used as the primary data layer.

In addition to storing user and transaction data, **MongoDB GridFS** is used for receipt files.

### Receipt upload process

```
Receipt selected
      ↓
Multipart request
      ↓
Multer processes file
      ↓
GridFS upload stream
      ↓
MongoDB stores receipt
      ↓
File ID stored with transaction

```

When a receipt is downloaded, the backend retrieves the corresponding GridFS file and streams it back to the authenticated user.

This approach avoids relying on ephemeral local storage during cloud deployment.

---

##  API Overview

### Authentication

| MethodEndpointDescription |                        |                               |
| ------------------------- | ---------------------- | ----------------------------- |
| `POST`                    | `/api/auth/signup`     | Register a new user           |
| `POST`                    | `/api/auth/verify-otp` | Verify registration/login OTP |
| `POST`                    | `/api/auth/resend-otp` | Resend OTP                    |
| `POST`                    | `/api/auth/login`      | Initiate login                |
| `POST`                    | `/api/auth/logout`     | Logout user                   |
| `GET`                     | `/api/auth/me`         | Get authenticated user        |

### Transactions

| MethodEndpointDescription |                                             |                         |
| ------------------------- | ------------------------------------------- | ----------------------- |
| `GET`                     | `/api/transactions`                         | Get user's transactions |
| `GET`                     | `/api/transactions/:id`                     | Get a transaction       |
| `POST`                    | `/api/transactions`                         | Create transaction      |
| `PUT`                     | `/api/transactions/:id`                     | Update transaction      |
| `DELETE`                  | `/api/transactions/:id`                     | Delete transaction      |
| `GET`                     | `/api/transactions/summary`                 | Get financial summary   |
| `GET`                     | `/api/transactions/:id/receipts/:receiptId` | Download receipt        |

> Endpoint names may vary slightly with future route changes; refer to the corresponding route files for the authoritative implementation.

---

##  Key Engineering Highlights

### Secure Authentication

JWT authentication with HTTP-only cookies reduces exposure of authentication tokens to client-side JavaScript while supporting authenticated API requests.

### User-Level Authorization

Transaction operations validate the authenticated user's ID against the transaction owner before allowing access, modification, or deletion.

### Persistent File Storage

Receipt files are stored using MongoDB GridFS instead of relying on the backend server's local filesystem, making receipt persistence suitable for cloud deployment.

### Modular Backend Architecture

The backend separates responsibilities across:

- Routes
- Controllers
- Models
- Authentication middleware
- Database configuration
- Email configuration

This keeps API logic maintainable and easier to extend.

### Responsive Data-Driven UI

The frontend combines React with Material UI, MUI Data Grid, MUI Charts, Tailwind CSS, and React Router to provide an interactive financial management interface.

---

##  Security Considerations

- Passwords are hashed using bcrypt.
- Authentication uses JWTs.
- JWTs are stored in HTTP-only cookies.
- Production cookies use `Secure` and cross-site-compatible settings.
- CORS origins can be explicitly configured.
- Transaction ownership is checked before sensitive operations.
- Receipt downloads require authentication.
- Sensitive configuration is supplied through environment variables rather than committed credentials.

---

##  Future Improvements

Potential enhancements include:

- Budget creation and budget-limit alerts
- Recurring transactions
- Monthly/yearly financial reports
- CSV/PDF transaction export
- Advanced spending trends
- Search and advanced transaction filtering
- Multi-currency support
- Automated recurring-expense detection
- Push/email spending alerts
- More granular financial analytics
- Automated testing and CI/CD
- Role-based administration

---

##  License

This project is currently available for educational and portfolio purposes.

---

## ‍ Author

**Bhagya Agrawal**

GitHub: [https://github.com/Bhagya-311205](https://github.com/Bhagya-311205)

---
