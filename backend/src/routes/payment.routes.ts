import { Router } from 'express';
import {
  getPayment,
  markPaymentFailure,
  markPaymentSuccess,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/:id', getPayment);
router.post('/:id/success', markPaymentSuccess);
router.post('/:id/failure', markPaymentFailure);

export default router;
