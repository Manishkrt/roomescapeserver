import mongoose from 'mongoose';

const canceledBookingSchema = new mongoose.Schema({
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    timeSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot' },
    numberOfPeople: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    discountPrice: { type: Number, default: 0, required: true },
    advancePay: { type: Number },
    paymentType: { type: String, enum: ["cash", "online"] },
    transactionId: { type: String },
    bookingBy: { type: String, enum: ['admin', 'client'], required: true },
    name: { type: String, required: true, trim: true, lowercase: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    couponCode: { type: String, trim: true },
    canceledAt: { type: Date, default: Date.now } // Store cancellation time
}, { timestamps: true });

const CanceledBookingModel = mongoose.model('CanceledBooking', canceledBookingSchema);

export default CanceledBookingModel;
