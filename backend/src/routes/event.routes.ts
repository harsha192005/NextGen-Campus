import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getMyRegistrationForEvent,
  registerForEvent,
  updateEvent,
} from '../controllers/event.controller.js';
import { admin, protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/my-registration', protect, getMyRegistrationForEvent);
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);
router.post('/:id/register', protect, registerForEvent);

export default router;
