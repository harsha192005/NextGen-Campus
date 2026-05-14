import mongoose, { type Types } from 'mongoose';

export interface IEvent {
  title: string;
  description: string;
  category: 'technical' | 'non-tech' | 'career' | 'sports' | 'hackathon';
  banner?: string;
  venue?: string;
  mode: 'online' | 'offline' | 'hybrid';
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer?: Types.ObjectId;
  tags: string[];
  isFree: boolean;
  fee?: number;
  rules: string[];
  speakers: string[];
  sponsors: string[];
  prizes: string[];
  mentors: string[];
  juryMembers: string[];
  problemStatements: string[];
  submissionDeadline?: Date;
  brochureUrl?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'non-tech', 'career', 'sports', 'hackathon'],
      required: true,
    },
    banner: String,
    venue: String,
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: Date,
    maxParticipants: Number,
    currentParticipants: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    isFree: { type: Boolean, default: true },
    fee: { type: Number, default: 0 },
    rules: [String],
    speakers: [String],
    sponsors: [String],
    prizes: [String],
    mentors: [String],
    juryMembers: [String],
    problemStatements: [String],
    submissionDeadline: Date,
    brochureUrl: String,
    minTeamSize: Number,
    maxTeamSize: Number,
  },
  { timestamps: true },
);

export default mongoose.model<IEvent>('Event', eventSchema);
