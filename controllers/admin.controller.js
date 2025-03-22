
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy'; 
import { sendOTP } from '../config/mail.js';
import AdminModel from '../models/admin.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const CookieTokenAge = process.env.Token_Age || 60*60*1000
const TokenExpiresIn = '1h'

// ✅ Register Admin
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Check if admin already exists
        const existingAdmin = await AdminModel.findOne({ email });
        if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

        // Create new admin
        const newAdmin = new AdminModel({ name, email, phone, password, role });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Admin Login
export const loginAdmin = async (req, res) => { 
    try {
        const { email, password } = req.body; 
        const admin = await AdminModel.findOne({ email });

        if (!admin) return res.status(400).json({ message: 'Invalid email or password' });

        // Compare password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        // If 2FA is enabled, send OTP
        if (admin.twoFactorAuth.enabled) {
            const otp = speakeasy.totp({
                secret: admin.twoFactorAuth.secret,
                encoding: 'base32',
            });

            // Send OTP via Email/SMS (Assuming `sendOTP` function)
            // await sendOTP(admin.email, otp);

            return res.status(200).json({ message: 'OTP sent', requires2FA: true, otp });
        }
      
        // Generate JWT token
        const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: TokenExpiresIn });

        res.cookie('accessToken', token, { httpOnly: true, secure: true, sameSite: "none", maxAge: CookieTokenAge });
        // res.cookie('accessToken', token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: CookieTokenAge });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Verify 2FA OTP
export const verify2FA = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const admin = await AdminModel.findOne({ email });

        if (!admin) return res.status(400).json({ message: 'Admin not found' });

        const verified = speakeasy.totp.verify({
            secret: admin.twoFactorAuth.secret,
            encoding: 'base32',
            token: otp,
        }); 
        if (!verified) return res.status(400).json({ message: 'Invalid OTP' });

        // Generate JWT token
        const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: TokenExpiresIn });
        // res.cookie('accessToken', token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: CookieTokenAge });
        res.cookie('accessToken', token, { httpOnly: true, secure: false, maxAge: CookieTokenAge });

        res.status(200).json({ message: '2FA Verified. Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}; 

// ✅ Enable 2FA
export const enable2FA = async (req, res) => {
    try {
        const { adminId } = req.body;
        const admin = await AdminModel.findById(adminId);

        if (!admin) return res.status(400).json({ message: 'Admin not found' });

        // Generate 2FA secret key
        const secret = speakeasy.generateSecret({ length: 20 }).base32;
        admin.twoFactorAuth = { enabled: true, secret };
        await admin.save();

        res.status(200).json({ message: '2FA enabled successfully', secret });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Disable 2FA
export const disable2FA = async (req, res) => {
    try {
        const { adminId } = req.body;
        const admin = await AdminModel.findById(adminId);

        if (!admin) return res.status(400).json({ message: 'Admin not found' });

        admin.twoFactorAuth = { enabled: false, secret: null };
        await admin.save();

        res.status(200).json({ message: '2FA disabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get Admin Profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await AdminModel.findById(req.admin.id).select('-password -isBlocked -isDeleted ');
        if (!admin) return res.status(404).json({ message: 'Admin not found'});
        res.status(200).json({...admin._doc, twoFactorAuth : {enabled : admin.twoFactorAuth.enabled}});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Update Admin
export const updateAdmin = async (req, res) => {
    try {
        const { name, phone, role } = req.body;
        const admin = await AdminModel.findByIdAndUpdate(req.admin.id, { name, phone, role }, { new: true });

        res.status(200).json({ message: 'Admin updated successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Delete Admin (Soft Delete)
export const deleteAdmin = async (req, res) => {
    try {
        await AdminModel.findByIdAndUpdate(req.admin.id, { isDeleted: true });
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Admin Logout
export const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie('accessToken', { httpOnly: true, secure: false, sameSite: 'Lax' });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

