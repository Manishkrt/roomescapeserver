import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }
});

 const TimeSlotModel = mongoose.model('TimeSlot', timeSlotSchema);

 export default TimeSlotModel
