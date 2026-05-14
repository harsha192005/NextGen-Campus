import crypto from 'node:crypto';
import AdminLog from '../models/AdminLog.js';
import Attendance from '../models/Attendance.js';
import Certificate from '../models/Certificate.js';
import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';
import Report from '../models/Report.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeEvent, serializeUser } from '../utils/serializers.js';

const logAction = async (req: any, module: string, action: string, targetId?: string, metadata?: Record<string, unknown>) => {
  if (!req.user?._id) return;
  await AdminLog.create({ adminId: req.user._id, module, action, targetId, metadata });
  req.app.get('io')?.emit('admin:activity', { module, action, targetId, createdAt: new Date() });
};

export const analytics = asyncHandler(async (_req, res) => {
  const [totalEvents, totalRegistrations, totalAttendance, totalStudents, totalCertificates, feedback, topEvents, topStudents, categoryData] =
    await Promise.all([
      Event.countDocuments(),
      Registration.countDocuments(),
      Attendance.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Certificate.countDocuments(),
      Feedback.find(),
      Event.find().sort({ currentParticipants: -1 }).limit(5),
      User.find({ role: 'student' }).sort({ xp: -1 }).limit(5),
      Event.aggregate([{ $group: { _id: '$category', value: { $sum: 1 } } }, { $project: { _id: 0, name: '$_id', value: 1 } }]),
    ]);

  const averageRating =
    feedback.length === 0
      ? 0
      : feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;

  const departmentWiseData = await User.aggregate([
    { $match: { role: 'student' } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $project: { _id: 0, department: { $ifNull: ['$_id', 'Unknown'] }, count: 1 } },
  ]);

  return res.json({
    success: true,
    analytics: {
      totalEvents,
      totalRegistrations,
      totalAttendance,
      totalStudents,
      totalCertificates,
      averageRating,
      departmentWiseData,
      categoryData,
      eventTrends: [],
      topEvents: topEvents.map(serializeEvent),
      topStudents: topStudents.map(serializeUser),
    },
  });
});

export const students = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: 'student' }).sort({ createdAt: -1 });
  return res.json({ success: true, students: users.map(serializeUser) });
});

export const createStudent = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, role: 'student', status: 'active' });
  await logAction(req, 'students', 'create', user._id.toString());
  return res.status(201).json({ success: true, student: serializeUser(user) });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: 'Student not found' });
  await logAction(req, 'students', 'update', user._id.toString());
  return res.json({ success: true, student: serializeUser(user) });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Student not found' });
  await logAction(req, 'students', 'delete', String(req.params.id));
  return res.json({ success: true });
});

export const setStudentStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!user) return res.status(404).json({ message: 'Student not found' });
  await logAction(req, 'students', req.body.status, user._id.toString());
  return res.json({ success: true, student: serializeUser(user) });
});

export const resetStudentPassword = asyncHandler(async (req, res) => {
  const password = req.body.password || `Reset@${crypto.randomBytes(3).toString('hex')}`;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Student not found' });
  user.password = password;
  await user.save();
  await logAction(req, 'students', 'reset_password', user._id.toString());
  return res.json({ success: true, temporaryPassword: password });
});

export const admins = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: { $in: ['admin', 'organizer', 'volunteer'] } }).sort({
    createdAt: -1,
  });
  return res.json({ success: true, admins: users.map(serializeUser) });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'admin', department, adminRole = 'moderator', permissions = [] } = req.body;

  if (!['admin', 'organizer', 'volunteer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid admin role' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, role, department, adminRole, permissions, status: 'active' });
  await logAction(req, 'admins', 'create', user._id.toString());
  return res.status(201).json({ success: true, admin: serializeUser(user) });
});

export const updateAdminRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'organizer', 'volunteer', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, adminRole: req.body.adminRole, permissions: req.body.permissions, status: req.body.status },
    { new: true },
  );
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await logAction(req, 'admins', 'update_role', user._id.toString());
  return res.json({ success: true, user: serializeUser(user) });
});

export const removeAdmin = asyncHandler(async (req, res) => {
  if (req.user?._id.toString() === req.params.id) {
    return res.status(400).json({ message: 'You cannot remove your own admin access' });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role: 'student' }, { new: true });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await logAction(req, 'admins', 'remove', user._id.toString());
  return res.json({ success: true, user: serializeUser(user) });
});

export const adminLogs = asyncHandler(async (_req, res) => {
  const logs = await AdminLog.find().populate('adminId', 'name email').sort({ createdAt: -1 }).limit(200);
  return res.json({ success: true, logs });
});

export const adminEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  return res.json({ success: true, events: events.map(serializeEvent) });
});

export const eventAction = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const action = req.params.action;

  if (action === 'publish') event.status = 'upcoming';
  else if (action === 'unpublish') event.status = 'cancelled';
  else if (action === 'cancel') event.status = 'cancelled';
  else if (action === 'close-registration') event.registrationDeadline = new Date();
  else if (action === 'open-registration') event.registrationDeadline = undefined;
  else if (action === 'feature') event.tags = Array.from(new Set([...(event.tags || []), 'featured']));
  else return res.status(400).json({ message: 'Unknown event action' });

  await event.save();
  await logAction(req, 'events', action, event._id.toString());
  return res.json({ success: true, event: serializeEvent(event) });
});

export const duplicateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).lean();
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const { _id, createdAt, updatedAt, currentParticipants, ...copy } = event as any;
  const duplicate = await Event.create({ ...copy, title: `${copy.title} Copy`, currentParticipants: 0, status: 'upcoming' });
  await logAction(req, 'events', 'duplicate', duplicate._id.toString());
  return res.status(201).json({ success: true, event: serializeEvent(duplicate as any) });
});

export const eventReport = asyncHandler(async (req, res) => {
  const [event, registrations, attendance] = await Promise.all([
    Event.findById(req.params.id),
    Registration.find({ eventId: req.params.id }).populate('userId', 'name email department'),
    Attendance.find({ eventId: req.params.id }).populate('userId', 'name email department'),
  ]);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  return res.json({ success: true, report: { event: serializeEvent(event), registrations, attendance } });
});

export const teams = asyncHandler(async (_req, res) => {
  const items = await Team.find().populate('hackathonId leaderId members.userId').sort({ createdAt: -1 });
  return res.json({ success: true, teams: items });
});

export const updateTeamAdmin = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('hackathonId leaderId members.userId');
  if (!team) return res.status(404).json({ message: 'Team not found' });
  await logAction(req, 'teams', 'update', team._id.toString());
  return res.json({ success: true, team });
});

export const deleteTeamAdmin = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  await logAction(req, 'teams', 'delete', String(req.params.id));
  return res.json({ success: true });
});

export const payments = asyncHandler(async (_req, res) => {
  const items = await Payment.find().populate('userId eventId registrationId').sort({ createdAt: -1 });
  return res.json({ success: true, payments: items });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, { status: req.body.status, failureReason: req.body.reason }, { new: true });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  await logAction(req, 'payments', req.body.status, payment._id.toString());
  req.app.get('io')?.emit('admin:payment', payment);
  return res.json({ success: true, payment });
});

export const paymentInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('userId eventId');
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  return res.json({ success: true, invoice: payment });
});

export const generateCertificate = asyncHandler(async (req, res) => {
  const { userId, eventId } = req.body;
  if (!userId || !eventId) {
    return res.status(400).json({ message: 'Student and event are required' });
  }

  const existing = await Certificate.findOne({ userId, eventId }).populate('userId eventId');
  if (existing) {
    return res.json({ success: true, certificate: existing, existing: true });
  }

  const certificateNumber = `CERT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const qrVerificationCode = crypto.randomBytes(16).toString('hex');

  const certificate = await Certificate.create({
    userId,
    eventId,
    certificateNumber,
    qrVerificationCode,
  });

  await logAction(req, 'certificates', 'generate', certificate._id.toString());
  const populated = await Certificate.findById(certificate._id).populate('userId eventId');
  return res.status(201).json({ success: true, certificate: populated });
});

export const certificates = asyncHandler(async (_req, res) => {
  const items = await Certificate.find().populate('userId eventId').sort({ createdAt: -1 });
  return res.json({ success: true, certificates: items });
});

export const revokeCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findByIdAndUpdate(req.params.id, { status: 'revoked' }, { new: true });
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  await logAction(req, 'certificates', 'revoke', certificate._id.toString());
  return res.json({ success: true, certificate });
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ qrVerificationCode: req.params.code }).populate('userId eventId');
  return res.json({ success: true, valid: Boolean(certificate && certificate.status === 'active'), certificate });
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { userId, eventId, isLate = false } = req.body;

  const attendance = await Attendance.findOneAndUpdate(
    { userId, eventId },
    {
      userId,
      eventId,
      isLate,
      verifiedBy: req.user?._id,
      checkInTime: new Date(),
    },
    { upsert: true, new: true, runValidators: true },
  );

  await Registration.findOneAndUpdate({ userId, eventId }, { status: 'attended' });

  return res.json({ success: true, attendance });
});

export const scanQrAttendance = asyncHandler(async (req, res) => {
  const rawCode = String(req.body.registrationId || req.body.qrCode || '').trim();
  let registrationId = rawCode;

  try {
    const parsed = JSON.parse(rawCode) as { registrationId?: string };
    registrationId = parsed.registrationId || rawCode;
  } catch {
    registrationId = rawCode;
  }

  const registration = await Registration.findOne({ registrationId }).populate('eventId userId');

  if (!registration) {
    return res.status(404).json({ message: 'Registration not found' });
  }

  const existing = await Attendance.findOne({
    userId: registration.userId,
    eventId: registration.eventId,
  });

  if (existing) {
    return res.json({
      success: true,
      duplicate: true,
      attendance: existing,
      registration,
      message: 'Attendance already marked',
    });
  }

  const attendance = await Attendance.create({
    userId: registration.userId,
    eventId: registration.eventId,
    verifiedBy: req.user?._id,
    checkInTime: new Date(),
  });

  registration.status = 'attended';
  await registration.save();

  return res.json({
    success: true,
    duplicate: false,
    attendance,
    registration,
    message: 'Attendance marked successfully',
  });
});

export const attendanceAnalytics = asyncHandler(async (_req, res) => {
  const [totalRegistrations, totalPresent, departmentWiseAttendance, eventWiseAttendance] =
    await Promise.all([
      Registration.countDocuments({ status: { $ne: 'cancelled' } }),
      Attendance.countDocuments(),
      Attendance.aggregate([
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $group: { _id: '$user.department', present: { $sum: 1 } } },
        {
          $project: {
            _id: 0,
            department: { $ifNull: ['$_id', 'Unknown'] },
            present: 1,
          },
        },
      ]),
      Attendance.aggregate([
        { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
        { $unwind: '$event' },
        { $group: { _id: '$event.title', present: { $sum: 1 } } },
        { $project: { _id: 0, event: '$_id', present: 1 } },
      ]),
    ]);

  const totalAbsent = Math.max(totalRegistrations - totalPresent, 0);
  const attendancePercentage =
    totalRegistrations === 0 ? 0 : Number(((totalPresent / totalRegistrations) * 100).toFixed(2));

  return res.json({
    success: true,
    analytics: {
      totalRegistrations,
      totalPresent,
      totalAbsent,
      attendancePercentage,
      departmentWiseAttendance,
      eventWiseAttendance,
      summary: [
        { name: 'Present', value: totalPresent },
        { name: 'Absent', value: totalAbsent },
      ],
    },
  });
});

export const attendanceRecords = asyncHandler(async (_req, res) => {
  const records = await Attendance.find()
    .populate('userId', 'name email department year phone')
    .populate('eventId', 'title venue startDate')
    .sort({ checkInTime: -1 });

  return res.json({ success: true, records });
});

export const removeAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByIdAndDelete(req.params.id);
  if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
  await logAction(req, 'attendance', 'remove', String(req.params.id));
  return res.json({ success: true });
});

export const exportAttendanceCsv = asyncHandler(async (_req, res) => {
  const records = await Attendance.find()
    .populate('userId', 'name email department year phone')
    .populate('eventId', 'title venue startDate')
    .sort({ checkInTime: -1 });

  const rows = [
    ['Student Name', 'Email', 'Department', 'Year', 'Event', 'Venue', 'Check In Time', 'Late'],
    ...records.map((record: any) => [
      record.userId?.name || '',
      record.userId?.email || '',
      record.userId?.department || '',
      record.userId?.year || '',
      record.eventId?.title || '',
      record.eventId?.venue || '',
      record.checkInTime?.toISOString() || '',
      record.isLate ? 'Yes' : 'No',
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
  return res.send(csv);
});

export const notifications = asyncHandler(async (_req, res) => {
  const items = await Notification.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
  return res.json({ success: true, notifications: items });
});

export const sendNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({ ...req.body, createdBy: req.user?._id });
  await logAction(req, 'notifications', 'send', notification._id.toString());
  req.app.get('io')?.emit('admin:notification', notification);
  return res.status(201).json({ success: true, notification });
});

export const reports = asyncHandler(async (_req, res) => {
  const items = await Report.find().populate('generatedBy', 'name email').sort({ createdAt: -1 });
  return res.json({ success: true, reports: items });
});

export const generateReport = asyncHandler(async (req, res) => {
  const type = req.body.type || 'analytics';
  const payload = {
    analytics: type === 'analytics' ? await Promise.all([Event.countDocuments(), User.countDocuments(), Registration.countDocuments(), Payment.countDocuments()]) : undefined,
    generatedAt: new Date(),
  };
  const report = await Report.create({ title: req.body.title || `${type} report`, type, generatedBy: req.user?._id, payload });
  await logAction(req, 'reports', 'generate', report._id.toString());
  return res.status(201).json({ success: true, report });
});

export const exportCsv = asyncHandler(async (req, res) => {
  const type = req.params.type;
  let rows: string[][] = [];
  if (type === 'students') {
    const users = await User.find({ role: 'student' });
    rows = [['Name', 'Email', 'Department', 'Status'], ...users.map((u) => [u.name, u.email, u.department || '', u.status])];
  } else if (type === 'payments') {
    const items = await Payment.find();
    rows = [['Payment ID', 'Amount', 'Status'], ...items.map((p) => [p._id.toString(), String(p.amount), p.status])];
  } else {
    const events = await Event.find();
    rows = [['Title', 'Category', 'Status', 'Registrations'], ...events.map((e) => [e.title, e.category, e.status, String(e.currentParticipants)])];
  }
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}.csv"`);
  return res.send(csv);
});
