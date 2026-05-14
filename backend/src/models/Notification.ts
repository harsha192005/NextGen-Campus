import mongoose, { type Types } from 'mongoose';

export interface INotification {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  audience: 'all' | 'students' | 'admins' | 'event';
  eventId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  readBy: Types.ObjectId[];
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error', 'announcement'], default: 'info' },
    audience: { type: String, enum: ['all', 'students', 'admins', 'event'], default: 'all' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export default mongoose.model<INotification>('Notification', notificationSchema);
