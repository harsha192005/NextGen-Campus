# Deployment Guide

Complete guide to deploy the NextGen Smart Campus platform to production.

## 🚀 Deployment Overview

- **Frontend**: Vercel (Recommended) or Netlify
- **Backend**: Render, Railway, or Heroku
- **Database**: MongoDB Atlas (Free Tier)
- **Media Storage**: Cloudinary (Free Tier)
- **AI**: Google Gemini API (Free Tier)

## 📱 Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free)
- Project pushed to GitHub

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/nextgen-campus.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Vite
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Environment Variables**
   Add in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate

## 🔧 Backend Deployment (Render)

### Prerequisites
- Render account (free)
- Backend code ready
- MongoDB Atlas database

### Steps

1. **Prepare Backend**
   ```bash
   cd backend
   # Ensure package.json has:
   "scripts": {
     "start": "node dist/server.js",
     "build": "tsc"
   }
   ```

2. **Create Web Service on Render**
   - Visit [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - Name: nextgen-campus-api
     - Environment: Node
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
     - Instance Type: Free

3. **Environment Variables**
   Add in Render dashboard:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_key
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   FRONTEND_URL=https://your-project.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Your API will be live at `https://your-backend.onrender.com`

### Important Notes
- Free tier sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid tier for always-on service

## 💾 MongoDB Atlas Setup

### Steps

1. **Create Cluster**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up/Login
   - Create new cluster (Free M0 tier)
   - Choose cloud provider and region

2. **Database Access**
   - Go to Database Access
   - Add New Database User
   - Set username and password
   - Grant readWrite permissions

3. **Network Access**
   - Go to Network Access
   - Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - (For production, restrict to specific IPs)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Add database name: `/nextgen-campus`

## ☁️ Cloudinary Setup

### Steps

1. **Create Account**
   - Visit [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

3. **Create Upload Preset**
   - Go to Settings → Upload
   - Add upload preset
   - Set to "unsigned" for frontend uploads
   - Configure folder and transformations

4. **Add to Environment Variables**
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
   ```

## 🤖 Google Gemini API Setup

### Steps

1. **Get API Key**
   - Visit [ai.google.dev](https://ai.google.dev)
   - Click "Get API key"
   - Create new project or use existing
   - Generate API key

2. **Add to Environment**
   ```env
   VITE_GEMINI_API_KEY=your_api_key
   ```

3. **Rate Limits (Free Tier)**
   - 60 requests per minute
   - 1,500 requests per day
   - Implement caching to stay within limits

## 📧 EmailJS Setup (Optional)

### Steps

1. **Create Account**
   - Visit [emailjs.com](https://www.emailjs.com)
   - Sign up for free

2. **Create Email Service**
   - Add email service (Gmail, Outlook, etc.)
   - Follow authentication steps

3. **Create Email Template**
   - Go to Email Templates
   - Create templates for:
     - Registration confirmation
     - Event reminders
     - Certificate emails

4. **Get Credentials**
   - Service ID
   - Template ID
   - User ID (Public Key)

5. **Add to Environment**
   ```env
   VITE_EMAILJS_SERVICE_ID=service_xxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxx
   VITE_EMAILJS_PUBLIC_KEY=xxx
   ```

## 🔒 Security Checklist

### Before Deployment

- [ ] Remove console.logs
- [ ] Set strong JWT secret
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use environment variables
- [ ] Enable HTTPS only
- [ ] Add security headers
- [ ] Implement CSP
- [ ] Set up monitoring
- [ ] Configure error logging

### Environment Variables Security

- ✅ Use different keys for dev/prod
- ✅ Never commit .env files
- ✅ Rotate keys periodically
- ✅ Use secrets management tools
- ✅ Restrict database access

## 📊 Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** - Frontend performance
2. **Sentry** - Error tracking
3. **LogRocket** - Session replay
4. **Google Analytics** - User analytics
5. **Uptime Robot** - Uptime monitoring

### Setup Sentry (Optional)

```bash
npm install @sentry/react @sentry/vite-plugin
```

Add to main.tsx:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

## 🚀 Performance Optimization

### Frontend

1. **Code Splitting**
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

2. **Image Optimization**
   - Use Cloudinary transformations
   - Lazy load images
   - Use WebP format

3. **Caching**
   - Enable browser caching
   - Use service workers
   - Implement CDN

4. **Bundle Size**
   ```bash
   npm run build -- --analyze
   ```

### Backend

1. **Database Indexing**
   ```typescript
   userSchema.index({ email: 1 });
   eventSchema.index({ startDate: 1, status: 1 });
   ```

2. **Caching with Redis**
   ```typescript
   import redis from 'redis';
   const client = redis.createClient();
   ```

3. **Compression**
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

## 🧪 Testing Before Deployment

### Frontend Tests
```bash
npm run test
npm run build
npm run preview
```

### Backend Tests
```bash
npm run test
npm run build
npm start
```

### Manual Testing Checklist

- [ ] Authentication works
- [ ] All routes accessible
- [ ] Forms validate properly
- [ ] Images upload correctly
- [ ] PDFs generate
- [ ] QR codes work
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Error handling works

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## 📝 Post-Deployment

### 1. Test Production
- Test all features
- Check API endpoints
- Verify database connections
- Test file uploads
- Check email notifications

### 2. Setup Monitoring
- Configure uptime monitoring
- Set up error tracking
- Enable analytics

### 3. Documentation
- Update README with live URLs
- Document API endpoints
- Create user guide

### 4. Backup Strategy
- Enable MongoDB automated backups
- Export production data weekly
- Document restore procedure

## 🆘 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**API Connection Error**
- Check CORS settings
- Verify API URL in frontend
- Check network access in MongoDB

**Environment Variables Not Working**
- Restart deployment
- Check variable names (case-sensitive)
- Verify values have no spaces

**Slow Performance**
- Check bundle size
- Enable caching
- Optimize images
- Add CDN

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## 🎉 Go Live Checklist

- [ ] All environment variables set
- [ ] Database connected
- [ ] API endpoints tested
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified
- [ ] Launch! 🚀

---

**Congratulations on deploying your NextGen Smart Campus platform! 🎊**
