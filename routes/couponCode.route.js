import express from 'express';
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus,
} from '../controllers/couponCode.controller.js'; 

const router = express.Router();

router.post('/create', createCoupon); // Create coupon
router.get('/all', getCoupons); // Get all coupons
router.get('/single/:id', getCouponById); // Get coupon by ID
router.put('/update/:id', updateCoupon); // Update coupon
router.delete('/remove/:id', deleteCoupon); // Delete coupon
router.patch('/update-status/:id', updateCouponStatus); // Update coupon status

export default router;
