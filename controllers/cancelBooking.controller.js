import mongoose from "mongoose";
import BookingModel from "../models/booking.model.js";
import CanceledBookingModel from "../models/cancelBooking.model.js";
 
export const cancelBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookingId } = req.params;

        // Find the booking
        const booking = await BookingModel.findById(bookingId).session(session);
        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Booking not found!" });
        }

        // Move booking to CanceledBookings collection
        const canceledBooking = new CanceledBookingModel(booking.toObject());
        await canceledBooking.save({ session });

        // Delete from original Booking collection
        await BookingModel.deleteOne({ _id: bookingId }, { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.json({ success: true, message: "Booking successfully canceled!" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const GetCanceledBooking = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        
        const total = await CanceledBookingModel.countDocuments();
        const response = await CanceledBookingModel.find().populate("game", "name")
            .sort({canceledAt : -1})
            .skip((page - 1) * limit)
            .limit(limit);
        
        res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: response
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
  };

