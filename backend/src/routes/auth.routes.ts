import { Router } from 'express';
import { body } from 'express-validator';
import { forgotPassword, login, me, register } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register,
);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, me);

export default router;
