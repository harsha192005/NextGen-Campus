import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';
import { serializeUser } from '../utils/serializers.js';

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

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

  return res.status(201).json({
    success: true,
    user: serializeUser(user),
    token: generateToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    success: true,
    user: serializeUser(user),
    token: generateToken(user._id),
  });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return res.json({ success: true, user: serializeUser(req.user) });
});

export const forgotPassword = asyncHandler(async (_req, res) => {
  return res.json({
    success: true,
    message: 'Password reset flow is not configured yet. Add an email provider to enable it.',
  });
});
