import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',  
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,  
    },
});

export const OTPModel = mongoose.model('otp', OTPSchema);
