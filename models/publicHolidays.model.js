import mongoose from 'mongoose';

const publicHolidaySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: String,
});

 const PublicHolidayModel = mongoose.model('PublicHoliday', publicHolidaySchema);

 export default PublicHolidayModel
