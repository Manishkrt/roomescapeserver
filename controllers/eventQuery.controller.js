import EventQueryModel from "../models/eventQuery.model.js";

export const CreateQuery = async (req, res) => {
    try { 
        const isExist = EventQueryModel.findOne({email : req.body.email, event : req.body.event })
        if(isExist){
          res.status(400).json({ message: 'This email is already exist for this Event' });
        }
        const newAdmin = new EventQueryModel({ ...req.body });
        await newAdmin.save(); 
        res.status(201).json({ message: 'success' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
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