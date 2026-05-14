import mongoose, { type Types } from 'mongoose';

export interface ITeamSubmission {
  teamId: Types.ObjectId;
  eventId: Types.ObjectId;
  submittedBy: Types.ObjectId;
  projectTitle: string;
  description?: string;
  githubUrl?: string;
  demoUrl?: string;
  pptUrl?: string;
  fileUrl?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  submittedAt?: Date;
}

const teamSubmissionSchema = new mongoose.Schema<ITeamSubmission>(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectTitle: { type: String, required: true },
    description: String,
    githubUrl: String,
    demoUrl: String,
    pptUrl: String,
    fileUrl: String,
    status: { type: String, enum: ['draft', 'submitted', 'reviewed'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<ITeamSubmission>('TeamSubmission', teamSubmissionSchema);
