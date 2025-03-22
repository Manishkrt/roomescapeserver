import TimeSlotModel from '../models/timeSlot.model.js';

/**
 * Create a new time slot.
 * Expected request body: { startTime: "HH:MM" }
 */
export const createTimeSlot = async (req, res) => {
  try {
    const { startTime } = req.body;
    if (!startTime) {
      return res.status(400).json({ error: 'startTime is required' });
    }

    const newTimeSlot = new TimeSlotModel({ startTime });
    await newTimeSlot.save();

    res.status(201).json({
      message: 'Time slot created successfully',
      timeSlot: newTimeSlot,
    });
  } catch (error) {
    console.error('Error creating time slot:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all time slots.
 */
export const getAllTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlotModel.find().sort({startTime : 1});
    res.status(200).json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update a time slot by its ID.
 * Expected request body may include: { startTime: "new value" }
 */
export const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTimeSlot = await TimeSlotModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedTimeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    res.status(200).json({
      message: 'Time slot updated successfully',
      timeSlot: updatedTimeSlot,
    });
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a time slot by its ID.
 */
export const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTimeSlot = await TimeSlotModel.findByIdAndDelete(id);

    if (!deletedTimeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    res.status(200).json({
      message: 'Time slot deleted successfully',
      timeSlot: deletedTimeSlot,
    });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
