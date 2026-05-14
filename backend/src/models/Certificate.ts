import mongoose, { type Types } from 'mongoose';

export interface ICertificate {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  certificateNumber: string;
  qrVerificationCode: string;
  issuedAt: Date;
  status: 'active' | 'revoked';
}

const certificateSchema = new mongoose.Schema<ICertificate>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    certificateNumber: { type: String, required: true, unique: true },
    qrVerificationCode: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  },
  { timestamps: true },
);

certificateSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model<ICertificate>('Certificate', certificateSchema);
