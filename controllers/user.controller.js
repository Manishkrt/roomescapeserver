import UserModel from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
// import PropertyModel from "../models/property.model.js" 
import { OTPModel } from "../models/otp.model.js"
dotenv.config()
const saltRounds = 10


const secretKey = process.env.JWT_SECRET_KEY

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => { 
    const {email} = req.body
    try { 
        const user = await UserModel.findOne({email});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } 
        const otp = generateOTP(); 
        const newOTP = new OTPModel({ userId : user._id, otp })
        await newOTP.save()
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) { 
        res.status(500).send({ message: err.message });
    }
}; 
export const createUser = async (req, res) => {
    const { name, email, phone, password, whatsapp } = req.body
    try {
        const existingUser = await UserModel.findOne({email});

        if (existingUser) {
            return res.status(409).json({
                message: 'This email already exists. Please log in or use a different one to sign up.',
            });
        }
        const passwordhass = await bcrypt.hash(password, saltRounds);
        const newUser = new UserModel({ name, email, phone, password: passwordhass })
        if (whatsapp) {
            newUser.contactVisibility.whatsapp = true
        } 
        await newUser.save() 
        res.status(201).json({ success: true, message: "success" })
    } catch (err) {
        res.status(500).send({ message: err.message });
    } 
}

export const userVerify = async (req, res) => {
    const { email, otp } = req.body; 
    try { 
        const user = await UserModel.findOne({email})
        const otpRecord = await OTPModel.findOne({userId: user._id, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        } 
        await OTPModel.deleteMany({ userId: user._id }); 
        await UserModel.findByIdAndUpdate(user._id, {$set:{ isVerified: true} }); 
        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}; 

export const userLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'Email not found. Please sign up to create an account.' });
        }
        if(user.isVerified === false){
            return res.status(401).json({ message: 'You are not verified.' });
        }
        const { password: hasedPassword } = user

        bcrypt.compare(password, hasedPassword, async (err, result) => {
            if (err || !result) {
                return res.status(400).json({ message: "Email and Password didn't match" });
            }
            else {
                const responsedata = await UserModel.findOne({ email }).select('-password')
                const data = responsedata._doc
                const token = jwt.sign({ ...data }, secretKey);
                return res.status(200).json({ success: true, token })
            }
        });
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}

export const userDetails = async (req, res) => {
    // const user = req.user
    // try {
    //     const userDetails = await UserModel.findById(user._id).select("-isBlocked")
    //     if (!userDetails) {
    //         return res.status(404).json({ message: 'User not found' })
    //     }
    //     const properties = await PropertyModel.find({ user: user._id, isDeleted: false }).select("-isDeleted -user")
    //     const response = {
    //         ...userDetails.toObject(),
    //         properties: properties.map(property => property.toObject()),
    //     };
    //     res.status(200).json(response)
    // } catch (err) {
    //     res.status(500).send({ message: err.message })
    // }
}



