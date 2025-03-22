import express from 'express';
import { 
  registerAdmin, 
  loginAdmin, 
  verify2FA, 
  enable2FA, 
  disable2FA, 
  getAdminProfile, 
  updateAdmin, 
  deleteAdmin, 
  logoutAdmin
} from '../controllers/admin.controller.js'; // Path to your controller
import { verifyAccessToken } from '../middlewares/admin.middleware.js';

const router = express.Router();

// ✅ Register Admin Route
router.post('/register', registerAdmin);

// ✅ Login Admin Route
router.post('/login', loginAdmin);

// ✅ Verify 2FA OTP
router.post('/verify-2fa', verify2FA);

// ✅ Enable 2FA Route
router.post('/enable-2fa', enable2FA);

// ✅ Disable 2FA Route
router.post('/disable-2fa', disable2FA);

// ✅ Get Admin Profile Route
router.get('/profile', verifyAccessToken, getAdminProfile);

// ✅ Update Admin Route
router.put('/update', updateAdmin);

// ✅ Soft Delete Admin Route 
router.delete('/delete', deleteAdmin);

// ✅ Soft Delete Admin Route 
router.get('/logout', logoutAdmin);

export default router;
