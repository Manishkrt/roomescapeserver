import mongoose, { Mongoose } from 'mongoose';

const EventQuerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true, 
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,  
        trim: true, 
    }, 
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    }
     
});

const EventQueryModel = mongoose.model('EventQuery', EventQuerySchema);

export default EventQueryModel
