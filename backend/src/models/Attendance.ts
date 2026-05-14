import mongoose, { type Types } from 'mongoose';

export interface IAttendance {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  checkInTime: Date;
  isLate: boolean;
  verifiedBy: Types.ObjectId;
}

const attendanceSchema = new mongoose.Schema<IAttendance>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    checkInTime: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

attendanceSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
