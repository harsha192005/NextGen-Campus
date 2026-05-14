import mongoose, { type Types } from 'mongoose';

export interface IJoinRequest {
  teamId: Types.ObjectId;
  eventId: Types.ObjectId;
  studentId: Types.ObjectId;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const joinRequestSchema = new mongoose.Schema<IJoinRequest>(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true },
);

joinRequestSchema.index({ teamId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IJoinRequest>('JoinRequest', joinRequestSchema);
