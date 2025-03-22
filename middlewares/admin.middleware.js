import jwt from 'jsonwebtoken';
import AdminModel from '../models/admin.model.js';
// import AdminModel from '../models/adminModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token from cookies
export const verifyAccessToken = async (req, res, next) => {
    try {
        // Check if the token is available in the cookies
        const token = req?.cookies?.accessToken;  
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach decoded admin information to the request
        req.admin = decoded;
        
        // Optionally, you can verify the admin exists in the database
        const admin = await AdminModel.findById(req.admin.id);
        if (!admin || admin.isDeleted) {
            return res.status(404).json({ message: 'Admin not found or deleted.' });
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
