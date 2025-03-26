 
import mongoose from 'mongoose';
import BlockGameModel from '../models/blockGame.model.js';
import BookingModel from '../models/booking.model.js';
import CouponCodeModel from '../models/couponCode.model.js';
import GameModel from '../models/game.model.js'
import PricingModel from '../models/pricing.model.js';
import PublicHolidayModel from '../models/publicHolidays.model.js';
import TimeSlotModel from '../models/timeSlot.model.js';
import CanceledBookingModel from '../models/cancelBooking.model.js';


import axios from "axios"; 
import crypto from "crypto";
import dotenv from "dotenv";
 

dotenv.config();

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY; 
const PaymentUrl = "https://api.phonepe.com/apis/hermes"; 
const SERVERURL = process.env.BACKEND_URL;
const DomainUrl = process.env.DOMAIN_URL
const keyIndex = 1

const cancelBooking = async (bookingId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try { 

      // Find the booking
      const booking = await BookingModel.findById(bookingId).session(session);
      if (!booking) {
          await session.abortTransaction();
          session.endSession();
          return 
      }

      // Move booking to CanceledBookings collection
      const canceledBooking = new CanceledBookingModel(booking.toObject());
      canceledBooking.onlinePaymentStatus = "failed"
      await canceledBooking.save({ session });

      // Delete from original Booking collection
      await BookingModel.deleteOne({ _id: bookingId }, { session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return  

  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return
  }
};
 
export const createBookingByClient = async (req, res) => {
  try { 
      const {
          game, bookingDate, timeSlot, timeSlotId, numberOfPeople, totalPrice, finalPrice, 
          discountPrice, advancePay, paymentType, name, email, phone, couponCode, bookingBy
      } = req.body;
      finalPrice

      // Ensure time slot is not double booked
      const existingBooking = await BookingModel.findOne({ game, bookingDate, timeSlotId });
      if (existingBooking) {
          return res.status(400).json({ error: "This time slot is already booked. Please choose another." });
      }

      // Create a new booking
      const bookingData = new BookingModel({ game, bookingDate, timeSlot, timeSlotId, numberOfPeople, totalPrice, finalPrice, discountPrice, advancePay, paymentType, name, email, phone, couponCode, bookingBy, onlinePaymentStatus : "pending"
      }); 
      // **PhonePe Payment Processing**
      const amount =  100; // Convert to paise 
      const merchantTransactionId = `MT${bookingData._id}`;
      const merchantUserId = `MUID${bookingData._id}`;  

      const paymentData = {
          merchantId: MERCHANT_ID,
          merchantTransactionId,
          merchantUserId,
          name,
          amount,  
          redirectUrl: `${SERVERURL}/api/v1/booking/phone-pay/redirect/${merchantTransactionId}`,
          callbackUrl: `${SERVERURL}/api/v1/booking/phone-pay/callback`,
          redirectMode: "POST",
          paymentInstrument: { type: "PAY_PAGE" }
      };

      const payload = JSON.stringify(paymentData);
      const base64Payload = Buffer.from(payload).toString("base64");

      const keyIndex = 1;
      const checksumString = base64Payload + "/pg/v1/pay" + SALT_KEY;
      const sha256 = crypto.createHash("sha256").update(checksumString).digest("hex");
      const checksum = sha256 + "###" + keyIndex;

      const prod_URL = `${PaymentUrl}/pg/v1/pay`;

      const options = {
          method: "POST",
          url: prod_URL,
          headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              "X-VERIFY": checksum
          },
          data: { request: base64Payload }
      };

      // Send request to PhonePe
      axios.request(options)
          .then(async (response) => { 
              await bookingData.save()
              return res.json(response.data)
          })
          .catch((error) => {
              console.error("PhonePe Error:", error);
              res.status(400).json({ error: "Payment failed. Please try again." });
          });
  }
  catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
  }
};

// https://roomescapeserver.vercel.app/api/v1/phone-pay/redirect/MT67e3e53884db8c70cf6eb633  

export const phonePePaymentredirect = async (req, res) => { 
  const merchantTransactionId = req.params.txnId  

  const bookingID = merchantTransactionId.replace(/^MT/, "")
  
  
  const merchantId = MERCHANT_ID
  const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + "###" + keyIndex;
  const options = {
      method: 'get',
      url: `${PaymentUrl}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}`,
          'X-MERCHANT-ID': `${merchantId}`
      }
  };


  axios.request(options).then(async (response) => { 
      if (response.data.success === true) { 
          console.log("success");

          const booking = await BookingModel.findById(bookingID)
          booking.onlinePaymentStatus = "success"
          await booking.save() 
          return res.redirect(`${DomainUrl}/payment-success`)
          // return res.redirect(`${DomainUrl}/order-confirmed/${orderId}`)
      } else {
          console.log("failed"); 
           res.redirect(`${DomainUrl}/payment-failed`)
           cancelBooking(bookingID)
           return
          // return res.redirect(`${DomainUrl}/payment-failed`)
      }
  })
      .catch((error) => {
        console.log("error");
        
          console.log(error);
          res.redirect(`${DomainUrl}/payment-failed`)
          cancelBooking(bookingID)
          return 
      }); 
}
 
export const phonePePaymentCallback = async (req, res) => {
    try {
        const phonePeSignature = req.headers["x-verify"]; // Signature from PhonePe
        const keyIndex = 1; // Default key index

        const callbackResponse = req.body;
        console.log("PhonePe Callback Data:", callbackResponse);

        // Generate hash to verify authenticity
        const responseString = JSON.stringify(callbackResponse);
        const checksumString = responseString + SALT_KEY;
        const sha256 = crypto.createHash("sha256").update(checksumString).digest("hex");
        const expectedSignature = sha256 + "###" + keyIndex;

        if (phonePeSignature !== expectedSignature) {
            console.log("Signature mismatch! Possible tampering.");
            return res.status(400).json({ error: "Invalid signature" });
        }

        const { merchantTransactionId, code, message } = callbackResponse;

        if (code === "PAYMENT_SUCCESS") {
            // Update booking status in the database
            // await BookingModel.findOneAndUpdate(
            //     { _id: merchantTransactionId.replace("MT", "") }, 
            //     { paymentStatus: "Success", transactionId: merchantTransactionId }
            // );

            console.log("Payment successful, booking updated.");
            return res.status(200).json({ success: true, message: "Payment successful" });
        } else {
            console.log("Payment failed:", message);
            return res.status(400).json({ success: false, message: "Payment failed" });
        }
    } catch (error) {
        console.error("Payment callback error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
 

// Fetch bookings with populated game name
export const getBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.find().populate("game", "name").sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Server error" });
  }
};





const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const checkTimeSlot = async (req, res) => {
  try {
    const { game, bookingDate } = req.body;
    if (!game) {
      return res.status(404).json({ message: "Game ID is required" });
    }
    if (!bookingDate) {
      return res.status(404).json({ message: "Booking Date is required" });
    }
    const bookingBlockDate = await BlockGameModel.findOne({ date: bookingDate, game: { $in: [game] } });

    if (bookingBlockDate) {
      return res.status(400).json({ reason: bookingBlockDate.reason, message: `this game in not available for date ${formatDate(bookingBlockDate.date)}. Please Choose another date. ` })
    }

    const gameData = await GameModel.findById(game);

    if (!gameData) {
      return res.status(404).json({ message: "Game not found" });
    }
    // Get all time slots
    const timeSlots = await TimeSlotModel.find();

    // Get booked slots for the given game and date
    const bookedSlots = await BookingModel.aggregate([
      {
        $match: {
          game: new mongoose.Types.ObjectId(game),
          bookingDate: new Date(bookingDate),
        },
      },
      {
        $group: {
          _id: "$timeSlot",
          totalParticipants: { $sum: "$numberOfPeople" },
        },
      },

    ]);
    const bookedSlots2 = await BookingModel.aggregate([
      {
        $match: {
          game: game,
          bookingDate: bookingDate,
        },
      },
      {
        $group: {
          _id: "$timeSlot",
          totalParticipants: { $sum: "$participants" },
        },
      },
    ]);
    const bookedMap = {};
    bookedSlots.forEach((slot) => {
      bookedMap[slot._id] = slot.totalParticipants;
    });

    const availableSlots = timeSlots.map((slot) => {
      const bookedCount = bookedMap[slot.startTime] || 0;
      const remainingSlots = bookedCount > 0 ? "Full" : "Available";
      // const remainingSlots = maxParticipent - bookedCount; 
      return {
        id: slot._id,
        timeSlot: slot.startTime,
        remainingSlots: remainingSlots,
        // remainingSlots: remainingSlots > 0 ? remainingSlots : 0,  
      };
    });

    res.status(200).json({
      game: gameData.name,
      bookingDate,
      availableSlots,
    });
  } catch (error) {
    console.error("Error in checkTimeSlot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const checkTotalPrice = async (req, res) => {
  const { numberOfPeople, bookingDate, couponCode } = req.body;

  if (!bookingDate) {
    return res.status(400).json({ message: "bookingDate is required" });
  }
  if (!numberOfPeople) {
    return res.status(400).json({ message: "numberOfPeople is required" });
  }
  if (numberOfPeople < 1) {
    return res.status(400).json({ message: "numberOfPeople must be at least 1" });
  }

  try {
    const bookingDateObj = new Date(bookingDate);
    const day = bookingDateObj.getDay();
    const isWeekend = (day === 0 || day === 6);
    const holiday = await PublicHolidayModel.findOne({ date: bookingDate });
    const isPublicHoliday = !!holiday;
    const dayType = (isWeekend || isPublicHoliday) ? 'weekend' : 'weekday';
    const pricingDoc = await PricingModel.findOne({ dayType });
    if (!pricingDoc) {
      return res.status(500).json({ error: `Pricing information not found for ${dayType}` });
    }
    let applicableRate = null;
    for (const range of pricingDoc.pricing) {
      if (numberOfPeople >= range.minPeople && numberOfPeople <= range.maxPeople) {
        applicableRate = range.rate;
        break;
      }
    }

    if (!applicableRate) {
      return res.status(400).json({ message: "No pricing available for the given number of people." });
    }
    const totalPrice = applicableRate * numberOfPeople;
    let discountAmount = 0;
    let finalPrice = totalPrice;
    let couponMessage = "";
    if (couponCode) {
      const coupon = await CouponCodeModel.findOne({ coupon: couponCode, status: true });

      if (coupon) {
        discountAmount = coupon.discountType == "percentage" ? (coupon.percentageNumber / 100) * totalPrice : coupon.discount;
        finalPrice = totalPrice - discountAmount;
        couponMessage = "Coupon code applied successfully";
      } else {
        couponMessage = "Coupon code expired/Invalid";
      }
    }

    return res.status(200).json({
      totalPrice,
      discountAmount,
      finalPrice,
      ratePerPerson: applicableRate,
      numberOfPeople,
      dayType,
      couponApplied: couponCode || null,
      message: couponMessage
    });

  } catch (error) {
    console.error("Error in checkTotalPrice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 


export const createBookingByAdmin = async (req, res) => { 
  try {
    const newBooking = new BookingModel({ ...req.body })
    await newBooking.save()
    res.status(201).json({ message: "bookig created", booking: newBooking });
  } catch (error) {
    console.error("Error in createBookingByAdmin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getBookingBySingleDate = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Booking date is required" });
    }

    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0); // Set UTC midnight

    const nextDay = new Date(bookingDate);
    nextDay.setUTCDate(bookingDate.getUTCDate() + 1);
    // Fetch all games
    const games = await GameModel.find({}, { _id: 1, name: 1, description: 1, minParticipent: 1, maxParticipent: 1, thumbnail: 1 });

    // Fetch all time slots
    const timeSlots = await TimeSlotModel.find({}, { _id: 1, startTime: 1 });


    const bookings = await BookingModel.aggregate([
      {

        $match: {
          bookingDate: {
            $gte: bookingDate,
            $lt: nextDay
          }
        }
      },
      {
        $group: {
          _id: {
            game: "$game",
            timeSlot: "$timeSlot"
          },
          bookings: {
            $push: {
              bookingId : "$_id",
              numberOfPeople: "$numberOfPeople",
              totalPrice: "$totalPrice",
              finalPrice: "$finalPrice",
              discountPrice: "$discountPrice",
              paymentType: "$paymentType",
              transactionId: "$transactionId",
              bookingBy: "$bookingBy",
              name: "$name",
              email: "$email",
              phone: "$phone",
              couponCode: "$couponCode",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              advancePay: "$advancePay"
            }
          }
        }
      }
    ]);

    // Convert bookings to a lookup map
    const bookingMap = new Map();
    bookings.forEach(booking => {
      const key = `${booking._id.game.toString()}-${booking._id.timeSlot.toString()}`;
      bookingMap.set(key, booking.bookings);
    });

    const result = games.map(game => ({
      _id: game._id,
      name: game.name,
      description: game.description,
      minParticipent: game.minParticipent,
      maxParticipent: game.maxParticipent,
      thumbnail: game.thumbnail,
      timeSlots: timeSlots.map(slot => ({
        _id: slot._id,
        startTime: slot.startTime,
        bookings: bookingMap.get(`${game._id.toString()}-${slot.startTime.toString()}`) || []
      }))
    }));

    res.status(200).json(result);
    // res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};










// i want something another. i have some games and some timeSlot like
// const game = [{
//   "_id": {
//     "$oid": "67a77a0623623718690ea80f"
//   },
//   "name": "the ruins of hampi",
//   "description": "<p>Get in the Shoes of the Archeologists and Unearth the Lost Treasure in the Ancient ruins of the temple of Hampi.</p>",
//   "maxParticipent": 6,
//   "thumbnail": "https://res.cloudinary.com/dgekr8y91/image/upload/v1739028997/game/up0q5z0ay5vxrvopalth.jpg",
//   "__v": 0,
//   "minParticipent": 2,
//   "bookingAvailable": false,
//   "status": true
// }, {
//   "_id": {
//     "$oid": "67a7fbcdd7511a44a502f08d"
//   },
//   "name": "the nuclear bunker",
//   "description": "<p>An international level Nuclear threat and a ticking clock, The fate of the world rests on how quickly you find the access point.</p>",
//   "minParticipent": 2,
//   "maxParticipent": 6,
//   "thumbnail": "https://res.cloudinary.com/dgekr8y91/image/upload/v1739062220/game/wpubqi0hmjsxhefiq4xi.webp",
//   "status": true,
//   "bookingAvailable": false,
//   "__v": 0
// }]
// const timeSlots = [{
//   "_id": {
//     "$oid": "67a3c503473caddc1c1d82a7"
//   },
//   "startTime": "11:00",
//   "__v": 0
// } , {
//   "_id": {
//     "$oid": "67a3c526473caddc1c1d82a9"
//   },
//   "startTime": "12:30",
//   "__v": 0
// },{
//   "_id": {
//     "$oid": "67a3c533473caddc1c1d82ab"
//   },
//   "startTime": "14:00",
//   "__v": 0
// }]

// these time slot for every game

// i want all game with group, in every game all timeslots now in every time slot bookings array if any match with game and time slot that data inside bookings array otherwise blank array. my structure should be like this. now again create getBookingBySingleDate controller with these criteria