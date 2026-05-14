import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import adminRoutes from './routes/admin.routes.js';
import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import studentRoutes from './routes/student.routes.js';
import teamRoutes from './routes/team.routes.js';
import { ensureAdminUser } from './utils/seedAdmin.js';

dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const normalizeOrigin = (value?: string) => {
  if (!value) return undefined;

  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, '');
  }
};

const allowedOrigins = new Set<string>(
  [
    normalizeOrigin(process.env.FRONTEND_URL),
    'https://harsha192005.github.io',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
  ].filter((origin): origin is string => Boolean(origin)),
);

const app = express();
const port = Number(process.env.PORT || 5000);
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: Array.from(allowedOrigins),
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('team:join', (teamId: string) => {
    socket.join(`team:${teamId}`);
    socket.to(`team:${teamId}`).emit('team:member-online', { socketId: socket.id });
  });

  socket.on('team:typing', ({ teamId, userName }) => {
    socket.to(`team:${teamId}`).emit('team:typing', { userName });
  });
});

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDatabase();
  await ensureAdminUser();

  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server');
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : error);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
