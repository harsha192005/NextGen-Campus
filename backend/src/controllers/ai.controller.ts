import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';
import { getGeminiModel } from '../config/gemini.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeEvent } from '../utils/serializers.js';

export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const model = getGeminiModel();

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  if (!model) {
    return res.json({
      success: true,
      reply:
        'I can help with campus events, certificates, teams, and recommendations. Configure GEMINI_API_KEY for live AI responses.',
    });
  }

  const result = await model.generateContent(
    `You are the NextGen Smart Campus assistant. Keep answers concise and helpful.\nUser: ${message}`,
  );

  return res.json({ success: true, reply: result.response.text() });
});

export const recommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const filters = user?.department
    ? { status: 'upcoming' as const, $or: [{ tags: user.department }, { category: 'technical' }] }
    : { status: 'upcoming' as const };

  const events = await Event.find(filters).sort({ startDate: 1 }).limit(5);
  return res.json({ success: true, recommendations: events.map(serializeEvent) });
});

export const analyzeFeedback = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const feedback = await Feedback.find(eventId ? { eventId } : {});
  const text = feedback.map((item) => item.comment).join('\n');
  const model = getGeminiModel();

  if (!text) {
    return res.json({ success: true, analysis: 'No feedback available yet.' });
  }

  if (!model) {
    const average = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;
    return res.json({
      success: true,
      analysis: `Average rating is ${average.toFixed(1)} from ${feedback.length} responses.`,
    });
  }

  const result = await model.generateContent(`Summarize this event feedback:\n${text}`);
  return res.json({ success: true, analysis: result.response.text() });
});
