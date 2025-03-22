import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    }, 
    date: {
        type: Date,
        required: true
    }, 
    location : {
        type : String, 
        required : true
    },
    timeStart : {
        type : String, 
        required : true
    },
    timeEnd : {
        type : String, 
        required : true
    },
    description : {
        type : String, 
        required : true
    },
    image : {
        type : String,
        required : true
    },
    count : {
        type : Number,
        default : 0
    }  
},
{
    timestamps: true,
}
);

const EventModel = mongoose.model('Event', EventSchema);

export default EventModel
