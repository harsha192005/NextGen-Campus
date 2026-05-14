import mongoose, { type Types } from 'mongoose';

export interface IPayment {
  registrationId: Types.ObjectId;
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  provider: 'razorpay_test';
  providerOrderId: string;
  providerPaymentId?: string;
  failureReason?: string;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    provider: { type: String, enum: ['razorpay_test'], default: 'razorpay_test' },
    providerOrderId: { type: String, required: true, unique: true },
    providerPaymentId: String,
    failureReason: String,
  },
  { timestamps: true },
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
