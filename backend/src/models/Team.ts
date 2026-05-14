import mongoose, { type Types } from 'mongoose';

export interface ITeam {
  name: string;
  teamId: string;
  logo?: string;
  hackathonId: Types.ObjectId;
  leaderId: Types.ObjectId;
  members: {
    userId: Types.ObjectId;
    role: 'leader' | 'developer' | 'designer' | 'presenter' | 'member';
    joinedAt: Date;
    status: 'online' | 'offline';
  }[];
  invitations: Types.ObjectId[];
  maxTeamSize: number;
  isLocked: boolean;
  announcements: string[];
  activityFeed: string[];
  projectTitle?: string;
  projectDescription?: string;
  submission?: string;
  score?: number;
  rank?: number;
  joinCode: string;
}

const teamSchema = new mongoose.Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    teamId: { type: String, required: true, unique: true },
    logo: String,
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['leader', 'developer', 'designer', 'presenter', 'member'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['online', 'offline'], default: 'offline' },
      },
    ],
    invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxTeamSize: { type: Number, default: 4 },
    isLocked: { type: Boolean, default: false },
    announcements: [String],
    activityFeed: [String],
    projectTitle: String,
    projectDescription: String,
    submission: String,
    score: Number,
    rank: Number,
    joinCode: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITeam>('Team', teamSchema);
