// User Types
export type UserRole = 'admin' | 'student' | 'organizer' | 'volunteer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  year?: number;
  phone?: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: Badge[];
  createdAt: Date;
}

// Event Types
export type EventCategory = 'technical' | 'non-tech' | 'career' | 'sports' | 'hackathon';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EventMode = 'online' | 'offline' | 'hybrid';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  banner: string;
  venue: string;
  mode: EventMode;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxParticipants: number;
  currentParticipants: number;
  status: EventStatus;
  organizer: string;
  tags: string[];
  isFree: boolean;
  fee?: number;
  rules?: string[];
  speakers?: string[];
  sponsors?: string[];
  prizes?: string[];
  mentors?: string[];
  juryMembers?: string[];
  problemStatements?: string[];
  submissionDeadline?: Date;
  brochureUrl?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  seatsAvailable?: number | null;
  createdAt: Date;
}

// Hackathon Types
export interface Team {
  id: string;
  name: string;
  hackathonId: string;
  leaderId: string;
  members: string[];
  invitations: string[];
  projectTitle?: string;
  projectDescription?: string;
  submission?: string;
  score?: number;
  rank?: number;
}

export interface Hackathon extends Event {
  rounds: HackathonRound[];
  currentRound: number;
  maxTeamSize: number;
  minTeamSize: number;
  prizes: Prize[];
}

export interface HackathonRound {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'completed';
}

export interface Prize {
  position: string;
  amount: string;
  description: string;
}

// Registration Types
export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  teamId?: string;
  status: 'registered' | 'attended' | 'absent' | 'cancelled';
  registeredAt: Date;
  registrationId: string;
  qrCode: string;
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed';
  paymentId?: string | { _id: string };
}

// Certificate Types
export interface Certificate {
  id: string;
  userId: string;
  eventId: string;
  certificateNumber: string;
  issuedAt: Date;
  qrVerificationCode: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  userId: string;
  eventId: string;
  checkInTime: Date;
  isLate: boolean;
  verifiedBy: string;
}

// Badge Types
export type BadgeType = 'hackathon_winner' | 'top_volunteer' | 'coding_champion' | 'active_participant' | 'workshop_expert';

export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

// Feedback Types
export interface Feedback {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
}

// Volunteer Types
export interface Volunteer {
  id: string;
  userId: string;
  eventId: string;
  task: string;
  status: 'assigned' | 'in-progress' | 'completed';
  checkIn?: Date;
  checkOut?: Date;
}

// Analytics Types
export interface Analytics {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalStudents?: number;
  totalCertificates?: number;
  averageRating: number;
  departmentWiseData: DepartmentData[];
  categoryData?: { name: string; value: number }[];
  eventTrends: EventTrend[];
  topEvents: Event[];
  topStudents: User[];
}

export interface DepartmentData {
  department: string;
  count: number;
}

export interface EventTrend {
  date: string;
  registrations: number;
  attendance: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
