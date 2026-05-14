import { Router } from 'express';
import {
  adminEvents,
  adminLogs,
  admins,
  analytics,
  attendanceAnalytics,
  attendanceRecords,
  certificates,
  createAdmin,
  createStudent,
  deleteStudent,
  deleteTeamAdmin,
  duplicateEvent,
  eventAction,
  eventReport,
  exportAttendanceCsv,
  exportCsv,
  generateCertificate,
  generateReport,
  markAttendance,
  notifications,
  paymentInvoice,
  payments,
  removeAdmin,
  removeAttendance,
  reports,
  resetStudentPassword,
  revokeCertificate,
  scanQrAttendance,
  sendNotification,
  setStudentStatus,
  students,
  teams,
  updateAdminRole,
  updatePaymentStatus,
  updateStudent,
  updateTeamAdmin,
  verifyCertificate,
} from '../controllers/admin.controller.js';
import { admin, protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, admin);

router.get('/analytics', analytics);
router.get('/logs', adminLogs);

router.get('/students', students);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/:id/status', setStudentStatus);
router.post('/students/:id/reset-password', resetStudentPassword);

router.get('/admins', admins);
router.post('/admins', createAdmin);
router.put('/admins/:id/role', updateAdminRole);
router.delete('/admins/:id', removeAdmin);

router.get('/events', adminEvents);
router.post('/events/:id/duplicate', duplicateEvent);
router.post('/events/:id/:action', eventAction);
router.get('/events/:id/report', eventReport);

router.get('/teams', teams);
router.put('/teams/:id', updateTeamAdmin);
router.delete('/teams/:id', deleteTeamAdmin);

router.get('/payments', payments);
router.post('/payments/:id/status', updatePaymentStatus);
router.get('/payments/:id/invoice', paymentInvoice);

router.get('/certificates', certificates);
router.post('/certificate/generate', generateCertificate);
router.post('/certificates/:id/revoke', revokeCertificate);
router.get('/certificates/verify/:code', verifyCertificate);

router.post('/attendance/mark', markAttendance);
router.post('/attendance/scan', scanQrAttendance);
router.get('/attendance/analytics', attendanceAnalytics);
router.get('/attendance/records', attendanceRecords);
router.delete('/attendance/:id', removeAttendance);
router.get('/attendance/export.csv', exportAttendanceCsv);

router.get('/notifications', notifications);
router.post('/notifications', sendNotification);

router.get('/reports', reports);
router.post('/reports', generateReport);
router.get('/export/:type.csv', exportCsv);

export default router;
