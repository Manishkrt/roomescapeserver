// import Pricing from '../models/Pricing.js';
import PricingModel from '../models/pricing.model.js';

const Pricing = {}




/**
 * Create a new pricing document.
 * Expected request body: { dayType: 'weekday'|'weekend', pricing: [{ minPeople, maxPeople, rate }, ...] }
 */
export const createPricing = async (req, res) => {
    try {
      const { dayType, pricing } = req.body;
  
      // Validate dayType
      if (!['weekday', 'weekend'].includes(dayType)) {
        return res.status(400).json({ error: 'Invalid dayType. Allowed values are "weekday" or "weekend".' });
      }
  
      const newPricing = new PricingModel({
        dayType,
        pricing,
      });
      await newPricing.save();
      res.status(201).json(newPricing);
    } catch (error) {
      console.error('Error creating pricing:', error);
      res.status(500).json({ error , message : 'Server error' });
    }
  };

/**
 * Get all pricing documents.
 */
export const getAllPricings = async (req, res) => { 
  try {
    const pricings = await PricingModel.find();
    res.status(200).json(pricings);
  } catch (error) {
    console.error('Error fetching pricings:', error);
    res.status(500).json({ error , message : 'Server error' });
  }
};





// ************** not in use **************

/**
 * Get a pricing document by its dayType.
 * Example URL: GET /api/pricings/weekend
 */
export const getPricingByDayType = async (req, res) => {
  try {
    const { dayType } = req.params;
    const pricing = await Pricing.findOne({ dayType });
    if (!pricing) {
      return res.status(404).json({ error: 'Pricing not found' });
    }
    res.status(200).json(pricing);
  } catch (error) {
    console.error('Error fetching pricing by dayType:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



/**
 * Update an existing pricing document identified by dayType.
 * Example URL: PUT /api/pricings/weekend
 * Request body may include the updated pricing array.
 */
export const updatePricing = async (req, res) => {
  try {
    const { dayType } = req.params;
    const updates = req.body;

    const updatedPricing = await Pricing.findOneAndUpdate(
      { dayType },
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedPricing) {
      return res.status(404).json({ error: 'Pricing not found' });
    }
    res.status(200).json(updatedPricing);
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a pricing document identified by dayType.
 * Example URL: DELETE /api/pricings/weekend
 */
export const deletePricing = async (req, res) => {
  try {
    const { dayType } = req.params;
    const deletedPricing = await Pricing.findOneAndDelete({ dayType });
    if (!deletedPricing) {
      return res.status(404).json({ error: 'Pricing not found' });
    }
    res.status(200).json({ message: 'Pricing deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
