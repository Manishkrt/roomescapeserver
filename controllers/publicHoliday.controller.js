
import PublicHolidayModel from '../models/publicHolidays.model.js';

/**
 * Create a new Public Holiday.
 * Expected request body: { date: "YYYY-MM-DD", description: "Holiday description" }
 */
export const createPublicHoliday = async (req, res) => {
  try {
    const { date, description } = req.body; 
    const newHoliday = new PublicHolidayModel({ date, description });
    await newHoliday.save(); 
    res.status(201).json({
      message: 'Public holiday created successfully',
      publicHoliday: newHoliday,
    });
  } catch (error) {
    console.error('Error creating public holiday:', error);
    res.status(500).json({ error , message : 'Server error' });
  }
};

/**
 * Get a public holiday by ID.
 * Example URL: GET /api/public-holidays/:id
 */
export const getPublicHoliday = async (req, res) => {
  try { 
    const holiday = await PublicHolidayModel.find({}).sort({ date: 1 }); 
    res.status(200).json(holiday);
  } catch (error) {
    console.error('Error fetching public holiday:', error);
    res.status(500).json({ error , message : 'Server error' });
  }
};

/**
 * Update an existing public holiday by ID.
 * Example URL: PUT /api/public-holidays/:id
 * Expected request body may include: { date, description }
 */
export const updatePublicHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const {date, description} = req.body;

    const updatedHoliday = await PublicHolidayModel.findByIdAndUpdate(
      id,
      {date, description},
      { new: true, runValidators: true }
    );

    if (!updatedHoliday) {
      return res.status(404).json({ error: 'Public holiday not found' });
    }

    res.status(200).json({
      message: 'Public holiday updated successfully',
      publicHoliday: updatedHoliday,
    });
  } catch (error) {
    console.error('Error updating public holiday:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a public holiday by ID.
 * Example URL: DELETE /api/public-holidays/:id
 */
export const deletePublicHoliday = async (req, res) => {
  try {
    const { id } = req.params; 
    const deletedHoliday = await PublicHolidayModel.findByIdAndDelete(id); 
    if (!deletedHoliday) {
      return res.status(404).json({ error: 'Public holiday not found' });
    } 
    res.status(200).json({
      message: 'Public holiday deleted successfully',
      publicHoliday: deletedHoliday,
    });
  } catch (error) {
    console.error('Error deleting public holiday:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
