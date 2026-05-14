import mongoose, { type Types } from 'mongoose';

export interface IAdminLog {
  adminId: Types.ObjectId;
  action: string;
  module: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

const adminLogSchema = new mongoose.Schema<IAdminLog>(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    targetId: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export default mongoose.model<IAdminLog>('AdminLog', adminLogSchema);
