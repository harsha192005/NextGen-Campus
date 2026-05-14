import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { Types } from 'mongoose';

export const generateToken = (id: Types.ObjectId | string) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id: id.toString() },
    secret as Secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' } as SignOptions,
  );
};
