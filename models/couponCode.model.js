import mongoose from 'mongoose';

// Define Coupon Code Schema
const CouponCodeSchema = new mongoose.Schema(
  {

    coupon: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      trim: true,
    }, 
    status: {
      type: Boolean,
      required: true,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const CouponCodeModel = mongoose.model('CouponCode', CouponCodeSchema);
export default CouponCodeModel;
