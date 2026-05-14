# Publish Guide

This project is ready for split deployment:

- Frontend: Vercel
- Backend API: Render
- Database: MongoDB Atlas

## 1. Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint or Web Service using `render.yaml`.
3. Set these Render environment variables from `backend/.env.production.example`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_USER_ID`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
4. Deploy the backend.
5. Confirm `https://your-render-url.onrender.com/api/health` returns success.

## 2. Frontend on Vercel

1. In Vercel, import the same GitHub repository.
2. Use the root project directory.
3. Set frontend environment variables from `.env.production.example`.
4. Set `VITE_API_URL` to your Render backend URL plus `/api`.
5. Deploy.

## 3. Final Production Settings

After Vercel deploys, update Render:

```env
FRONTEND_URL=https://your-vercel-url.vercel.app
```

Then redeploy the backend so CORS and Socket.io accept the live frontend.

## Do Not Publish

Never publish these local files:

- `.env`
- `.env.*` except examples
- `backend/.env`
- `backend/.env.*` except examples
- `node_modules`
- log files
