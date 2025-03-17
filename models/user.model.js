import mongoose from 'mongoose';

 
const userSchema = new mongoose.Schema({
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
    password: {
        type: String, 
    },
    isVerified : {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,  
    },
     
},
{ timestamps: true });

const UserModel = mongoose.model('user', userSchema);

export default UserModel;