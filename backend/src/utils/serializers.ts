import type { HydratedDocument } from 'mongoose';
import type { IEvent } from '../models/Event.js';
import type { IUser } from '../models/User.js';

export const serializeUser = (user: HydratedDocument<IUser>) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  adminRole: user.adminRole,
  permissions: user.permissions,
  status: user.status,
  department: user.department,
  year: user.year,
  phone: user.phone,
  avatar: user.avatar,
  xp: user.xp,
  level: user.level,
  badges: user.badges,
  createdAt: user.createdAt,
});

export const serializeEvent = (event: HydratedDocument<IEvent>) => ({
  id: event._id.toString(),
  title: event.title,
  description: event.description,
  category: event.category,
  banner: event.banner || '',
  venue: event.venue || '',
  mode: event.mode,
  startDate: event.startDate,
  endDate: event.endDate,
  registrationDeadline: event.registrationDeadline,
  maxParticipants: event.maxParticipants,
  currentParticipants: event.currentParticipants,
  status: event.status,
  organizer: event.organizer?.toString() || '',
  tags: event.tags,
  isFree: event.isFree,
  fee: event.fee,
  rules: event.rules || [],
  speakers: event.speakers || [],
  sponsors: event.sponsors || [],
  prizes: event.prizes || [],
  mentors: event.mentors || [],
  juryMembers: event.juryMembers || [],
  problemStatements: event.problemStatements || [],
  submissionDeadline: event.submissionDeadline,
  brochureUrl: event.brochureUrl,
  minTeamSize: event.minTeamSize,
  maxTeamSize: event.maxTeamSize,
  seatsAvailable: event.maxParticipants
    ? Math.max(event.maxParticipants - event.currentParticipants, 0)
    : null,
  createdAt: event.createdAt,
});
