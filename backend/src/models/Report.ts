import mongoose, { type Types } from 'mongoose';

export interface IReport {
  title: string;
  type: 'analytics' | 'events' | 'students' | 'payments' | 'attendance';
  generatedBy: Types.ObjectId;
  payload: Record<string, unknown>;
}

const reportSchema = new mongoose.Schema<IReport>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['analytics', 'events', 'students', 'payments', 'attendance'], required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export default mongoose.model<IReport>('Report', reportSchema);
