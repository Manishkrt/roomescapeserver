import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true,
    },
    bookingDate: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String, 
        required: true,
    },
    timeSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot', 
    },
    
    numberOfPeople: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    finalPrice: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
        default : 0,
        required: true,
    },
    advancePrice: {
        type: Number, 
    },
    paymentType: {
        type: String,
        enum : ["cash", "online"], 
    },
    transactionId : {
        type : String
    },
    bookingBy : {
        type : String,
        enum : ['admin', 'client'],
        required : true
    },
    name : {
        type : String,
        required : true,
        trim : true,
        lowercase: true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    phone: {
        type: String,
        required: true,
        trim: true, 
        match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],  
      },
    couponCode: {
        type: String, 
        trim: true,  
      }
},
    {
        timestamps: true
    }
);

 const BookingModel =mongoose.model('Booking', bookingSchema);

 export default BookingModel
