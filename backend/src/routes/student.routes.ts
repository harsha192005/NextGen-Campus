import { Router } from 'express';
import { certificates, dashboard, registeredEvents } from '../controllers/student.controller.js';
import { createTeam, joinTeam } from '../controllers/team.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/dashboard', dashboard);
router.get('/events', registeredEvents);
router.get('/certificates', certificates);
router.post('/team/create', createTeam);
router.post('/team/join', joinTeam);

export default router;
