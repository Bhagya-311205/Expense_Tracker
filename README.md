# Expense Tracker Deployment Guide

This repo is set up for a source-code deployment flow:

- Backend on Render from the `backend/` folder.
- Frontend on Vercel from the `frontend/` folder.
- MongoDB Atlas for the database.
- Receipt uploads stored in MongoDB GridFS, so no separate file host is needed.

## What changed in code

- Session code is still commented out.
- Auth uses JWT stored in an httpOnly cookie.
- Production cookies are configured for cross-site use between Vercel and Render.
- Frontend API calls now use `VITE_API_URL` instead of a hardcoded localhost URL.
- File uploads no longer rely on Render disk storage.
- Receipts are saved in MongoDB GridFS inside the same Atlas cluster.

## Backend deployment on Render

Create a new **Web Service** in Render and connect this repository.

Use these settings:

- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check path:** `/api/health`

Set these environment variables in Render:

- `NODE_ENV=production`
- `PORT` will be managed by Render
- `MONGODB_URI=<your Atlas connection string>`
- `JWT_SECRET=<strong random secret>`
- `FRONTEND_URL=https://your-frontend.vercel.app`
- `EMAIL_USER=<your email address>`
- `EMAIL_PASS=<your email password or app password>`

If you already use `EMAIL_PASSWORD`, the code accepts that too.

Important notes:

- Render must serve HTTPS for cookies to work correctly in production.
- The app is already configured to return `sameSite: none` and `secure: true` cookies in production.
- The `/uploads` static folder is only used in local development now.

## Frontend deployment on Vercel

Create a new **Project** in Vercel and import the same repository.

Use these settings:

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`

Set this environment variable in Vercel:

- `VITE_API_URL=https://your-backend.onrender.com/api`

Important notes:

- The frontend already sends cookies using `withCredentials: true`.
- Do not hardcode the backend URL in the frontend code.
- If you change the Render URL later, update `VITE_API_URL` and redeploy.

## MongoDB Atlas

Atlas is used for both the app data and receipt files.

Set these up in Atlas:

- Create a database user.
- Use the connection string in `MONGODB_URI`.
- Make sure the Render service can reach Atlas.

Receipts are stored in GridFS, so they remain available after redeploys.

## Upload behavior

Receipt uploads now work like this:

1. The frontend sends files as multipart form data.
2. The backend uploads them to MongoDB GridFS.
3. The transaction record stores the file ID and metadata.
4. Downloads stream the file back from GridFS.

This means:

- No Cloudinary.
- No AWS S3.
- No dependency on local filesystem persistence on Render.

## Local development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Final checklist

- Backend deployed on Render.
- Frontend deployed on Vercel.
- `MONGODB_URI` set to Atlas.
- `JWT_SECRET` set.
- `FRONTEND_URL` set to the Vercel domain.
- `VITE_API_URL` set to the Render API URL.
- OTP email credentials set.
- Receipt upload and download tested end to end.
