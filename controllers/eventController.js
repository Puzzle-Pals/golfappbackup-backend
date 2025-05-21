const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

exports.addEvent = async (req, res) => {
  const { date, course, details } = req.body;
  try {
    const event = new Event({ date, course, details });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event' });
  }
};

exports.updateEvent = async (req, res) => {
  const { date, course, details } = req.body;
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { date, course, details }, { new: true });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};