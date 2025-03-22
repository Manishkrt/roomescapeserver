import EventQueryModel from "../models/eventQuery.model.js";
import EventModel from "../models/event.model.js";
import mongoose from "mongoose";


export const AddEventQuery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
      const { name, email, phone, event } = req.body;

      // Create Event Query
      const newEventQuery = new EventQueryModel({ name, email, phone, event });
      await newEventQuery.save({ session });

      // Increment Event count
      const updatedEvent = await EventModel.findByIdAndUpdate(
          event,
          { $inc: { count: 1 } },
          { new: true, session }
      );

      if (!updatedEvent) {
          throw new Error("Event not found");
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ message: "Query submitted successfully", newEventQuery, updatedEvent });
  } catch (error) { 
      await session.abortTransaction();
      session.endSession();

      res.status(500).json({ message: "Server error", error: error.message });
  }
};




export const GetEventQuery = async (req, res) => {
  try {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      
      const total = await EventQueryModel.countDocuments();
      const response = await EventQueryModel.find()
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


export const UpdateRespond = async (req, res)=>{
    const {id} = req.params
    const {responded} = req.body
    try { 
        const newAdmin = await EventQueryModel.findByIdAndUpdate(id , { $set : {responded} }); 
        res.status(200).json({ message: 'success' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const deleteEventQuery = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await EventQueryModel.findByIdAndDelete(id);
  
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