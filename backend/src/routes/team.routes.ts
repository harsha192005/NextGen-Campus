import { Router } from 'express';
import {
  acceptRequest,
  changeMemberRole,
  createTeam,
  getTeam,
  inviteMember,
  joinTeam,
  leaveTeam,
  myTeams,
  recommendations,
  rejectRequest,
  removeMember,
  sendMessage,
  submitProject,
  teamAnalytics,
  transferLeadership,
  updateTeam,
} from '../controllers/team.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/mine', myTeams);
router.get('/recommendations/:eventId', recommendations);
router.post('/create', createTeam);
router.post('/join', joinTeam);
router.get('/:id', getTeam);
router.put('/:id', updateTeam);
router.post('/:id/invite', inviteMember);
router.post('/requests/:requestId/accept', acceptRequest);
router.post('/requests/:requestId/reject', rejectRequest);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/leave', leaveTeam);
router.put('/:id/members/:memberId/role', changeMemberRole);
router.post('/:id/members/:memberId/transfer-leadership', transferLeadership);
router.post('/:id/messages', sendMessage);
router.get('/:id/analytics', teamAnalytics);
router.post('/:id/submission', submitProject);

export default router;
