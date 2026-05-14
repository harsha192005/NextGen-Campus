import { Router } from 'express';
import { analyzeFeedback, chat, recommendations } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/chat', protect, chat);
router.post('/recommendations', protect, recommendations);
router.post('/analyze-feedback', protect, analyzeFeedback);

export default router;
