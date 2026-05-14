import Certificate from '../models/Certificate.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeEvent } from '../utils/serializers.js';

export const dashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const [registrations, certificates, upcomingEvents] = await Promise.all([
    Registration.find({ userId }).populate('eventId'),
    Certificate.find({ userId }).populate('eventId'),
    Event.find({ status: 'upcoming' }).sort({ startDate: 1 }).limit(5),
  ]);

  return res.json({
    success: true,
    stats: {
      registeredEvents: registrations.length,
      certificates: certificates.length,
      xp: req.user?.xp || 0,
      level: req.user?.level || 1,
    },
    registrations,
    certificates,
    upcomingEvents: upcomingEvents.map(serializeEvent),
  });
});

export const registeredEvents = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ userId: req.user?._id }).populate('eventId');
  return res.json({ success: true, registrations });
});

export const certificates = asyncHandler(async (req, res) => {
  const items = await Certificate.find({ userId: req.user?._id }).populate('eventId');
  return res.json({ success: true, certificates: items });
});
