import mongoose, { type Types } from 'mongoose';

export interface IFeedback {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  rating: number;
  comment: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const feedbackSchema = new mongoose.Schema<IFeedback>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  },
  { timestamps: true },
);

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
