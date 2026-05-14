# Backend Setup Guide

This guide will help you set up the complete backend for the NextGen Smart Campus platform.

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Google Gemini API key (free)
- Cloudinary account (free)
- EmailJS account (optional, free)

## 🚀 Backend Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Google Gemini API** - AI features
- **EmailJS** - Email notifications
- **QRCode** - QR generation

## 📦 Backend Installation

### 1. Create Backend Directory

```bash
mkdir backend
cd backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install multer cloudinary qrcode @google/generative-ai
npm install express-validator express-rate-limit helmet
npm install -D nodemon typescript @types/node @types/express
```

### 3. Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── cloudinary.ts
│   │   └── gemini.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   ├── Registration.ts
│   │   ├── Team.ts
│   │   ├── Certificate.ts
│   │   ├── Attendance.ts
│   │   └── Feedback.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── student.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── team.routes.ts
│   │   └── ai.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── student.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── team.controller.ts
│   │   └── ai.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   ├── generateToken.ts
│   │   ├── qrGenerator.ts
│   │   └── emailService.ts
│   └── server.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🔧 Configuration Files

### Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextgen-campus

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# EmailJS
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_USER_ID=your_user_id

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Admin Credentials
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=Admin@123
```

## 📝 Sample Code Structure

### 1. Database Configuration (src/config/database.ts)

```typescript
import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
```

### 2. User Model (src/models/User.ts)

```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'student', 'organizer', 'volunteer'],
    default: 'student' 
  },
  department: String,
  year: Number,
  phone: String,
  avatar: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
```

### 3. Event Model (src/models/Event.ts)

```typescript
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['technical', 'non-tech', 'career', 'sports', 'hackathon'],
    required: true 
  },
  banner: String,
  venue: String,
  mode: { type: String, enum: ['online', 'offline', 'hybrid'] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: Date,
  maxParticipants: Number,
  currentParticipants: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming' 
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  isFree: { type: Boolean, default: true },
  fee: Number,
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
```

### 4. Auth Controller (src/controllers/auth.controller.ts)

```typescript
import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, year, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      year,
      phone,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        xp: user.xp,
        level: user.level,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        xp: user.xp,
        level: user.level,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
```

### 5. Auth Middleware (src/middleware/auth.middleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};
```

### 6. Server Setup (src/server.ts)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { connectDatabase } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Connect to database
connectDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)
- `POST /api/events/:id/register` - Register for event

### Student
- `GET /api/student/dashboard` - Get dashboard data
- `GET /api/student/events` - Get registered events
- `GET /api/student/certificates` - Get certificates
- `POST /api/student/team/create` - Create team
- `POST /api/student/team/join` - Join team

### Admin
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/students` - Get all students
- `POST /api/admin/certificate/generate` - Generate certificate
- `POST /api/admin/attendance/mark` - Mark attendance

### AI
- `POST /api/ai/chat` - AI chatbot
- `POST /api/ai/recommendations` - Get event recommendations
- `POST /api/ai/analyze-feedback` - Analyze feedback

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit .env file
2. **Password Hashing**: Use bcrypt with salt rounds ≥ 10
3. **JWT**: Use strong secret, set expiration
4. **Rate Limiting**: Implement to prevent abuse
5. **Input Validation**: Validate all user inputs
6. **CORS**: Configure allowed origins
7. **Helmet**: Use security headers

## 📊 MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Add database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string
6. Replace in .env file

## 🎨 Google Gemini API Setup

1. Visit [ai.google.dev](https://ai.google.dev)
2. Get API key
3. Add to .env file
4. Use for AI features

## ☁️ Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get cloud name, API key, and secret
3. Add to .env file
4. Use for image uploads

## 🚀 Deployment

### Render Deployment

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Add environment variables
5. Deploy

### Vercel Functions (Alternative)

1. Use Vercel Serverless Functions
2. Deploy alongside frontend
3. Configure routes in vercel.json

## 🧪 Testing

```bash
# Install testing dependencies
npm install -D jest supertest @types/jest @types/supertest

# Run tests
npm test
```

## 📝 Additional Features to Implement

- WebSocket for real-time notifications
- Redis for caching
- Bull for job queues
- Swagger for API documentation
- Winston for logging
- PM2 for process management

## 🤝 Support

For backend setup issues, refer to:
- Express.js documentation
- MongoDB documentation
- JWT documentation
- Node.js best practices

---

**Happy Coding! 🚀**
