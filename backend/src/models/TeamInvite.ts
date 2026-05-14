import mongoose, { type Types } from 'mongoose';

export interface ITeamInvite {
  teamId: Types.ObjectId;
  eventId: Types.ObjectId;
  invitedEmail: string;
  invitedBy: Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  inviteToken: string;
}

const teamInviteSchema = new mongoose.Schema<ITeamInvite>(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    invitedEmail: { type: String, required: true, lowercase: true, trim: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    inviteToken: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITeamInvite>('TeamInvite', teamInviteSchema);
