
import CouponCodeModel from "../models/couponCode.model.js";

// Create a new coupon
export const createCoupon = async (req, res) => {
  try { 
    const newCoupon = new CouponCodeModel({...req.body});
    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

// Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await CouponCodeModel.find();
    res.status(200).json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

// Get a single coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await CouponCodeModel.findById(id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ message: 'Error fetching coupon', error: error.message });
  }
};

// Update a coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCoupon = await CouponCodeModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCoupon) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

// Delete a coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await CouponCodeModel.findByIdAndDelete(id);
    if (!deletedCoupon) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};

// Update coupon status (Enable/Disable)
export const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedCoupon = await CouponCodeModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedCoupon) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json({ message: 'Coupon status updated successfully', coupon: updatedCoupon });
  } catch (error) {
    console.error('Error updating coupon status:', error);
    res.status(500).json({ message: 'Error updating coupon status', error: error.message });
  }
};
