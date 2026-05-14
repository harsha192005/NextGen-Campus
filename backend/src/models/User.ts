import bcrypt from 'bcryptjs';
import mongoose, { type Model, type Types } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student' | 'organizer' | 'volunteer';
  adminRole?: 'super_admin' | 'event_admin' | 'finance_admin' | 'attendance_admin' | 'moderator';
  permissions: string[];
  status: 'active' | 'suspended' | 'blocked';
  department?: string;
  year?: number;
  phone?: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'student', 'organizer', 'volunteer'],
      default: 'student',
    },
    adminRole: {
      type: String,
      enum: ['super_admin', 'event_admin', 'finance_admin', 'attendance_admin', 'moderator'],
    },
    permissions: [String],
    status: { type: String, enum: ['active', 'suspended', 'blocked'], default: 'active' },
    department: String,
    year: Number,
    phone: String,
    avatar: String,
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser, Model<IUser>>('User', userSchema);
