import crypto from 'node:crypto';
import Event from '../models/Event.js';
import JoinRequest from '../models/JoinRequest.js';
import Team from '../models/Team.js';
import TeamInvite from '../models/TeamInvite.js';
import TeamMessage from '../models/TeamMessage.js';
import TeamSubmission from '../models/TeamSubmission.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateTeam = (query: any) =>
  query
    .populate('hackathonId', 'title category startDate submissionDeadline maxTeamSize minTeamSize')
    .populate('leaderId', 'name email department')
    .populate('members.userId', 'name email department year avatar');

const emitTeamUpdate = (req: any, teamId: string, event: string, payload: unknown) => {
  req.app.get('io')?.to(`team:${teamId}`).emit(event, payload);
};

const isLeader = (team: any, userId?: unknown) => team.leaderId.toString() === String(userId);

const teamIsFull = (team: any) => team.members.length >= team.maxTeamSize;

export const createTeam = asyncHandler(async (req, res) => {
  const { name, hackathonId, projectTitle, projectDescription, logo, maxTeamSize } = req.body;
  const event = await Event.findById(hackathonId);

  if (!event || event.category !== 'hackathon') {
    return res.status(400).json({ message: 'Teams can only be created for hackathon events' });
  }

  const existingTeam = await Team.findOne({ hackathonId, 'members.userId': req.user?._id });
  if (existingTeam) {
    return res.status(400).json({ message: 'You are already in a team for this event' });
  }

  const allowedMax = event.maxTeamSize || 4;
  const requestedMax = Math.min(Number(maxTeamSize || allowedMax), allowedMax);

  const team = await Team.create({
    name,
    logo,
    hackathonId,
    leaderId: req.user?._id,
    teamId: `TEAM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    joinCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
    maxTeamSize: requestedMax,
    members: [{ userId: req.user?._id, role: 'leader', status: 'online' }],
    projectTitle,
    projectDescription,
    activityFeed: [`${req.user?.name} created the team`],
  });

  const populated = await populateTeam(Team.findById(team._id));
  emitTeamUpdate(req, team._id.toString(), 'team:updated', populated);
  return res.status(201).json({ success: true, team: populated });
});

export const joinTeam = asyncHandler(async (req, res) => {
  const { joinCode, teamId, leaderEmail, invitationToken, message } = req.body;
  let team = null;

  if (invitationToken) {
    const invite = await TeamInvite.findOne({ inviteToken: invitationToken, status: 'pending' });
    if (!invite) return res.status(404).json({ message: 'Invitation not found or expired' });
    team = await Team.findById(invite.teamId);
  } else if (joinCode) {
    team = await Team.findOne({ joinCode: String(joinCode).trim().toUpperCase() });
  } else if (teamId) {
    team = await Team.findOne({ teamId: String(teamId).trim().toUpperCase() });
  } else if (leaderEmail) {
    const leader = await User.findOne({ email: String(leaderEmail).toLowerCase() });
    team = leader ? await Team.findOne({ leaderId: leader._id }) : null;
  }

  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.isLocked) return res.status(400).json({ message: 'Team joining is locked' });
  if (team.members.some((member) => member.userId.equals(req.user?._id))) {
    return res.status(400).json({ message: 'You are already in this team' });
  }
  if (teamIsFull(team)) return res.status(400).json({ message: 'Team is full' });

  const request = await JoinRequest.findOneAndUpdate(
    { teamId: team._id, studentId: req.user?._id },
    {
      teamId: team._id,
      eventId: team.hackathonId,
      studentId: req.user?._id,
      message,
      status: 'pending',
    },
    { upsert: true, new: true, runValidators: true },
  ).populate('studentId', 'name email department year');

  emitTeamUpdate(req, team._id.toString(), 'team:join-request', request);
  return res.status(201).json({ success: true, request, message: 'Join request sent to team leader' });
});

export const myTeams = asyncHandler(async (req, res) => {
  const teams = await populateTeam(Team.find({ 'members.userId': req.user?._id }).sort({ createdAt: -1 }));
  const requests = await JoinRequest.find({ studentId: req.user?._id }).populate('teamId eventId');
  const invites = await TeamInvite.find({ invitedEmail: req.user?.email, status: 'pending' }).populate('teamId eventId');
  return res.json({ success: true, teams, requests, invites });
});

export const getTeam = asyncHandler(async (req, res) => {
  const team = await populateTeam(Team.findById(req.params.id));
  if (!team) return res.status(404).json({ message: 'Team not found' });
  const [requests, messages, submission] = await Promise.all([
    JoinRequest.find({ teamId: team._id }).populate('studentId', 'name email department year').sort({ createdAt: -1 }),
    TeamMessage.find({ teamId: team._id }).populate('senderId', 'name email').sort({ createdAt: 1 }).limit(100),
    TeamSubmission.findOne({ teamId: team._id }).sort({ createdAt: -1 }),
  ]);
  return res.json({ success: true, team, requests, messages, submission });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const team = await Team.findById(req.params.id).populate('hackathonId', 'title');
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!isLeader(team, req.user?._id)) return res.status(403).json({ message: 'Only team leader can invite members' });

  const invite = await TeamInvite.create({
    teamId: team._id,
    eventId: team.hackathonId,
    invitedEmail: email,
    invitedBy: req.user?._id,
    inviteToken: crypto.randomBytes(16).toString('hex'),
  });

  const invitationLink = `${process.env.FRONTEND_URL}/student/teams?invite=${invite.inviteToken}`;
  // EmailJS can be wired here with the same service credentials used by registration emails.
  emitTeamUpdate(req, team._id.toString(), 'team:invite', invite);
  return res.status(201).json({ success: true, invite, invitationLink });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await JoinRequest.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Join request not found' });
  const team = await Team.findById(request.teamId);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!isLeader(team, req.user?._id)) return res.status(403).json({ message: 'Only team leader can approve requests' });
  if (teamIsFull(team)) return res.status(400).json({ message: 'Team is full' });

  if (!team.members.some((member) => member.userId.equals(request.studentId))) {
    team.members.push({ userId: request.studentId, role: 'member', joinedAt: new Date(), status: 'offline' });
    team.activityFeed.push('A new member joined the team');
  }
  request.status = 'accepted';
  await Promise.all([team.save(), request.save()]);
  const populated = await populateTeam(Team.findById(team._id));
  emitTeamUpdate(req, team._id.toString(), 'team:updated', populated);
  return res.json({ success: true, team: populated });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await JoinRequest.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Join request not found' });
  const team = await Team.findById(request.teamId);
  if (!team || !isLeader(team, req.user?._id)) return res.status(403).json({ message: 'Only team leader can reject requests' });
  request.status = 'rejected';
  await request.save();
  emitTeamUpdate(req, team._id.toString(), 'team:request-rejected', request);
  return res.json({ success: true, request });
});

export const removeMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!isLeader(team, req.user?._id)) return res.status(403).json({ message: 'Only team leader can remove members' });
  if (String(team.leaderId) === req.params.memberId) return res.status(400).json({ message: 'Transfer leadership before removing leader' });
  team.members = team.members.filter((member) => String(member.userId) !== req.params.memberId);
  team.activityFeed.push('A member was removed');
  await team.save();
  const populated = await populateTeam(Team.findById(team._id));
  emitTeamUpdate(req, team._id.toString(), 'team:updated', populated);
  return res.json({ success: true, team: populated });
});

export const leaveTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (isLeader(team, req.user?._id)) return res.status(400).json({ message: 'Transfer leadership before leaving' });
  team.members = team.members.filter((member) => !member.userId.equals(req.user?._id));
  team.activityFeed.push(`${req.user?.name} left the team`);
  await team.save();
  emitTeamUpdate(req, team._id.toString(), 'team:updated', team);
  return res.json({ success: true });
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!isLeader(team, req.user?._id)) return res.status(403).json({ message: 'Only team leader can edit team' });
  const { name, logo, isLocked, announcements, projectTitle, projectDescription } = req.body;
  Object.assign(team, { name, logo, isLocked, announcements, projectTitle, projectDescription });
  team.activityFeed.push('Team information updated');
  await team.save();
  const populated = await populateTeam(Team.findById(team._id));
  emitTeamUpdate(req, team._id.toString(), 'team:updated', populated);
  return res.json({ success: true, team: populated });
});

export const changeMemberRole = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!isLeader(team, req.user?._id)) return res.status(403).json({ message: 'Only team leader can change roles' });
  const member = team.members.find((item) => String(item.userId) === req.params.memberId);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  member.role = req.body.role || 'member';
  await team.save();
  const populated = await populateTeam(Team.findById(team._id));
  emitTeamUpdate(req, team._id.toString(), 'team:updated', populated);
  return res.json({ success: true, team: populated });
});

export const transferLeadership = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!isLeader(team, req.user?._id)) return res.status(403).json({ message: 'Only team leader can transfer leadership' });
  const newLeader = team.members.find((item) => String(item.userId) === req.params.memberId);
  if (!newLeader) return res.status(404).json({ message: 'Member not found' });
  team.leaderId = newLeader.userId;
  team.members.forEach((member) => {
    member.role = String(member.userId) === req.params.memberId ? 'leader' : member.role === 'leader' ? 'member' : member.role;
  });
  await team.save();
  const populated = await populateTeam(Team.findById(team._id));
  emitTeamUpdate(req, team._id.toString(), 'team:updated', populated);
  return res.json({ success: true, team: populated });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { content, type = 'message', fileUrl } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team || !team.members.some((member) => member.userId.equals(req.user?._id))) {
    return res.status(403).json({ message: 'You are not a team member' });
  }
  const message = await TeamMessage.create({
    teamId: team._id,
    senderId: req.user?._id,
    content,
    type,
    fileUrl,
  });
  const populated = await message.populate('senderId', 'name email');
  emitTeamUpdate(req, team._id.toString(), 'team:message', populated);
  return res.status(201).json({ success: true, message: populated });
});

export const teamAnalytics = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate('hackathonId');
  if (!team) return res.status(404).json({ message: 'Team not found' });
  const submission = await TeamSubmission.findOne({ teamId: team._id });
  const progress =
    (team.projectTitle ? 20 : 0) +
    (team.projectDescription ? 20 : 0) +
    (submission?.githubUrl ? 20 : 0) +
    (submission?.demoUrl ? 20 : 0) +
    (submission ? 20 : 0);
  return res.json({
    success: true,
    analytics: {
      progress,
      participation: team.members.length,
      capacity: team.maxTeamSize,
      attendance: 0,
      ranking: team.rank || null,
      compatibilityScore: Math.min(100, 60 + team.members.length * 8),
      availability: team.isLocked ? 'closed' : 'open',
    },
  });
});

export const submitProject = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!team.members.some((member) => member.userId.equals(req.user?._id))) {
    return res.status(403).json({ message: 'You are not a team member' });
  }
  const submission = await TeamSubmission.findOneAndUpdate(
    { teamId: team._id },
    {
      ...req.body,
      teamId: team._id,
      eventId: team.hackathonId,
      submittedBy: req.user?._id,
      status: 'submitted',
      submittedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true },
  );
  team.submission = submission._id.toString();
  team.activityFeed.push('Project submission updated');
  await team.save();
  emitTeamUpdate(req, team._id.toString(), 'team:submission', submission);
  return res.json({ success: true, submission });
});

export const recommendations = asyncHandler(async (req, res) => {
  const openTeams = await populateTeam(
    Team.find({
      hackathonId: req.params.eventId,
      isLocked: false,
    }).limit(10),
  );
  const ranked = openTeams.map((team: any) => ({
    team,
    compatibilityScore: Math.min(98, 55 + team.members.length * 10 + (req.user?.department ? 10 : 0)),
    reason: 'Recommended based on department, open seats, and team activity.',
  }));
  return res.json({ success: true, recommendations: ranked });
});
