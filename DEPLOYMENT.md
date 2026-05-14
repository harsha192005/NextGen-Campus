# Deployment Guide

Production deployment guide for the NextGen Smart Campus platform.

## Current Repository

GitHub:

```text
https://github.com/harsha192005/NextGen-Campus.git
```

Main branch:

```text
main
```

Frontend GitHub Pages URL:

```text
https://harsha192005.github.io/NextGen-Campus/
```

## Deployment Overview

- Frontend: GitHub Pages is already configured, Vercel is recommended for full production.
- Backend API: Render.
- Database: MongoDB Atlas.
- Media storage: Cloudinary.
- AI: Google Gemini API.
- Email: EmailJS.

## Important Production Flow

Deploy in this order:

1. Push code to GitHub.
2. Deploy backend on Render.
3. Copy the Render backend URL.
4. Add frontend env variable `VITE_API_URL=https://your-render-api.onrender.com/api`.
5. Deploy frontend on Vercel or GitHub Pages.
6. Update Render `FRONTEND_URL` to the final frontend URL.
7. Redeploy backend so CORS and Socket.io accept the live frontend.

## GitHub Push

This project is already connected to GitHub.

For future updates:

```bash
git add .
git commit -m "Update project"
git push
```

Never commit `.env` or `backend/.env`. They are ignored by `.gitignore`.

## Frontend Option 1: GitHub Pages

GitHub Pages deployment is configured in:

```text
.github/workflows/pages.yml
```

The workflow runs automatically on every push to `main`.

### Enable GitHub Pages

In GitHub:

1. Open `harsha192005/NextGen-Campus`.
2. Go to `Settings`.
3. Open `Pages`.
4. Set source to `GitHub Actions`.
5. Save.

### Required GitHub Secret

Add this repository secret:

```text
VITE_API_URL=https://your-render-api.onrender.com/api
```

Location:

```text
GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret
```

### Local GitHub Pages Build Check

```bash
npm run build -- --base=/NextGen-Campus/
```

## Frontend Option 2: Vercel

Vercel is better for production because it supports custom domains, previews, and easy environment management.

### Steps

1. Visit `https://vercel.com`.
2. Click `New Project`.
3. Import `https://github.com/harsha192005/NextGen-Campus`.
4. Use these settings:
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:

```env
VITE_API_URL=https://your-render-api.onrender.com/api
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

6. Deploy.

After Vercel deploys, copy the Vercel URL and set it as `FRONTEND_URL` in Render.

## Backend Deployment: Render

The backend is ready for Render using:

```text
render.yaml
```

### Render Setup

1. Visit `https://render.com`.
2. Click `New +`.
3. Choose `Blueprint` if using `render.yaml`, or choose `Web Service`.
4. Connect `https://github.com/harsha192005/NextGen-Campus`.
5. For manual Web Service setup:
   - Name: `nextgen-smart-campus-api`
   - Environment: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install --include=dev && npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

### Render Environment Variables

Set these in Render:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextgen-campus
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_USER_ID=
ADMIN_EMAIL=harsha7411156@gmail.com
ADMIN_PASSWORD=replace_before_deploy
```

Do not use the local `.env` values directly in public docs or commits.

### Backend Health Check

After Render deploys, test:

```text
https://your-render-api.onrender.com/api/health
```

Expected response:

```json
{
  "success": true,
  "status": "ok"
}
```

## MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add Network Access rule:

```text
0.0.0.0/0
```

4. Copy the connection string.
5. Add the database name:

```text
/nextgen-campus
```

Example:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/nextgen-campus
```

## Cloudinary

Set these only on the backend host:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Gemini

Set this only on the backend host:

```env
GEMINI_API_KEY=
```

## EmailJS

Backend uses:

```env
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_USER_ID=
```

Frontend may use:

```env
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

## Render Build Error: Missing Type Declarations

If Render shows errors like this:

```text
Could not find a declaration file for module 'express'
Try `npm i --save-dev @types/express`
```

Use this backend Build Command:

```bash
npm install --include=dev && npm run build
```

Render may skip dev dependencies when `NODE_ENV=production` is set. TypeScript needs dev dependencies during the build, even though they are not needed at runtime.

## Production Checks

Run locally before pushing:

```bash
npm run build
npm --prefix backend run build
```

Check these after deployment:

- Login works.
- Admin login works.
- Event registration saves to MongoDB.
- QR code registration pass is generated.
- Admin attendance scanner can mark attendance.
- Certificates can be generated.
- Team creation and join requests work.
- Payment status updates work.
- Dashboard data loads from API.

## Troubleshooting

### Frontend shows blank page

Check:

- `VITE_API_URL` is set correctly.
- GitHub Pages source is set to `GitHub Actions`.
- Build command uses `--base=/NextGen-Campus/` for GitHub Pages.
- Browser console has no API or routing errors.

### API connection fails

Check:

- Render service is awake.
- `FRONTEND_URL` on Render matches the live frontend URL.
- `MONGODB_URI` is valid.
- Atlas Network Access allows Render.

### Admin cannot login

Check Render logs for `ensureAdminUser`.

Confirm these env vars exist:

```env
ADMIN_EMAIL=harsha7411156@gmail.com
ADMIN_PASSWORD=your_production_password
JWT_SECRET=your_secret
```

### CORS error

Set Render:

```env
FRONTEND_URL=https://your-frontend-url
```

Then redeploy the backend.

## Final Go-Live Checklist

- [ ] Backend deployed on Render.
- [ ] MongoDB Atlas connected.
- [ ] Render `/api/health` works.
- [ ] Frontend deployed on Vercel or GitHub Pages.
- [ ] `VITE_API_URL` points to Render.
- [ ] Render `FRONTEND_URL` points to frontend.
- [ ] Admin account is created.
- [ ] Registration, QR attendance, certificates, teams, and dashboards tested.
- [ ] Secrets are stored only in host dashboards, not GitHub.
