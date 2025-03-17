import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
        trim: true,
    }, 
    eventDate: {
        type: Date,
        required: true,
    }, 
    eventDetails : {
        type : String, 
    },
    images : {
        type : Array,
        required : true
    },
    totalApply : {
        type : Number,
        default : 0
    }
     
});

const EventModel = mongoose.model('Event', EventSchema);

export default EventModel
