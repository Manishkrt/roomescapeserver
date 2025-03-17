import mongoose from 'mongoose';

const pricingRangeSchema = new mongoose.Schema({
  minPeople: { type: Number, required: true },
  maxPeople: { type: Number, required: true },
  rate: { type: Number, required: true },
});

const pricingSchema = new mongoose.Schema({
  dayType: {
    type: String,
    enum: ['weekday', 'weekend'], 
    required: true,
  },
  pricing: [pricingRangeSchema],
});

const PricingModel = mongoose.model('Pricing', pricingSchema);

export default PricingModel
 