import Payment from '../models/Payment.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    userId: req.user?._id,
  }).populate('eventId registrationId');

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  return res.json({
    success: true,
    payment,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
  });
});

export const markPaymentSuccess = asyncHandler(async (req, res) => {
  const { providerPaymentId } = req.body;
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?._id },
    { status: 'paid', providerPaymentId },
    { new: true },
  );

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  await Registration.findByIdAndUpdate(payment.registrationId, { paymentStatus: 'paid' });

  return res.json({ success: true, payment });
});

export const markPaymentFailure = asyncHandler(async (req, res) => {
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?._id },
    { status: 'failed', failureReason: req.body.reason || 'Payment failed' },
    { new: true },
  );

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  await Registration.findByIdAndUpdate(payment.registrationId, { paymentStatus: 'failed' });

  return res.json({ success: true, payment });
});
