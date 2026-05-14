import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Payment from '../models/Payment.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendRegistrationEmail } from '../utils/emailService.js';
import { generateQrCode } from '../utils/qrGenerator.js';
import { serializeEvent } from '../utils/serializers.js';

export const getEvents = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;
  const filter: Record<string, unknown> = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) filter.$text = { $search: String(search) };

  const events = await Event.find(filter).sort({ startDate: 1 });
  return res.json({ success: true, events: events.map(serializeEvent) });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  return res.json({ success: true, event: serializeEvent(event) });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    organizer: req.user?._id,
  });

  return res.status(201).json({ success: true, event: serializeEvent(event) });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  return res.json({ success: true, event: serializeEvent(event) });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  await Registration.deleteMany({ eventId: event._id });
  return res.json({ success: true });
});

export const registerForEvent = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (event.registrationDeadline && event.registrationDeadline < new Date()) {
    return res.status(400).json({ message: 'Registration deadline has passed' });
  }

  const existing = await Registration.findOne({ userId: req.user._id, eventId: event._id });
  if (existing) {
    return res.status(400).json({ message: 'Already registered for this event' });
  }

  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: event._id,
      status: { $ne: 'cancelled' },
      $or: [
        { maxParticipants: { $exists: false } },
        { maxParticipants: null },
        { $expr: { $lt: ['$currentParticipants', '$maxParticipants'] } },
      ],
    },
    { $inc: { currentParticipants: 1 } },
    { new: true },
  );

  if (!updatedEvent) {
    return res.status(400).json({ message: 'Event is full' });
  }

  const registrationId = new mongoose.Types.ObjectId();
  const registrationCode = `REG-${Date.now()}-${registrationId.toString().slice(-6).toUpperCase()}`;
  const paymentStatus = event.isFree || !event.fee ? 'not_required' : 'pending';
  const qrCode = await generateQrCode({
    registrationId: registrationCode,
    eventId: event._id.toString(),
    userId: req.user._id.toString(),
  });

  const registration = await Registration.create({
    _id: registrationId,
    userId: req.user._id,
    eventId: event._id,
    registrationId: registrationCode,
    qrCode,
    paymentStatus,
  });

  let payment = null;
  if (paymentStatus === 'pending') {
    payment = await Payment.create({
      registrationId: registration._id,
      userId: req.user._id,
      eventId: event._id,
      amount: event.fee || 0,
      providerOrderId: `order_test_${registrationCode}`,
    });
    registration.paymentId = payment._id;
    await registration.save();
  }

  const email = await sendRegistrationEmail({
    toEmail: req.user.email,
    studentName: req.user.name,
    eventName: event.title,
    registrationId: registrationCode,
    eventDate: event.startDate,
    venue: event.venue,
    paymentStatus,
  });

  return res.status(201).json({
    success: true,
    registration,
    event: serializeEvent(updatedEvent),
    payment,
    confirmation: {
      studentName: req.user.name,
      eventName: event.title,
      registrationId: registrationCode,
      qrCode,
      eventDate: event.startDate,
      venue: event.venue,
      paymentStatus,
      amount: event.fee || 0,
      emailSent: email.sent,
    },
  });
});

export const getMyRegistrationForEvent = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({
    userId: req.user?._id,
    eventId: req.params.id,
  }).populate('eventId');

  return res.json({ success: true, registration });
});
