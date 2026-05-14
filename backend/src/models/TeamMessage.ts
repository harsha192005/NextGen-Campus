import mongoose, { type Types } from 'mongoose';

export interface ITeamMessage {
  teamId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: 'message' | 'announcement' | 'file';
  fileUrl?: string;
  reactions: { emoji: string; userId: Types.ObjectId }[];
  pinned: boolean;
}

const teamMessageSchema = new mongoose.Schema<ITeamMessage>(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['message', 'announcement', 'file'], default: 'message' },
    fileUrl: String,
    reactions: [
      {
        emoji: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<ITeamMessage>('TeamMessage', teamMessageSchema);
