import mongoose from 'mongoose';

const BulkBookingQuerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) { 
                return /^\d{10}$/.test(v); // Check for 10 digits
            },
            message: 'Phone number must be 10 digits.'
        }
    }, 
    totalPlayer: {
        type: Number,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    eventType : {
        type : String,
        required: true
    },
    eventDetails : {
        type : String, 
    },
    
    responded:{
        type: Boolean,
        default : false
    } 
});

const BulkBookingQueryModel = mongoose.model('BulkBookingQuery', BulkBookingQuerySchema);

export default BulkBookingQueryModel
