import mongoose, { type Types } from 'mongoose';

export interface IRegistration {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  teamId?: Types.ObjectId;
  status: 'registered' | 'attended' | 'absent' | 'cancelled';
  registrationId: string;
  qrCode: string;
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed';
  paymentId?: Types.ObjectId;
  registeredAt: Date;
}

const registrationSchema = new mongoose.Schema<IRegistration>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    status: {
      type: String,
      enum: ['registered', 'attended', 'absent', 'cancelled'],
      default: 'registered',
    },
    registrationId: { type: String, required: true, unique: true },
    qrCode: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'failed'],
      default: 'not_required',
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model<IRegistration>('Registration', registrationSchema);
