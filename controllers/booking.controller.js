// import Booking from '../models/Booking.js';
// import Game from '../models/Game.js';
// import TimeSlot from '../models/TimeSlot.js';
// import PublicHoliday from '../models/PublicHoliday.js';
// import Pricing from '../models/Pricing.js';

import BookingModel from '../models/booking.model.js';
import CouponCodeModel from '../models/couponCode.model.js';
import GameModel from '../models/game.model.js'
import PricingModel from '../models/pricing.model.js';
import PublicHolidayModel from '../models/publicHolidays.model.js';
import TimeSlotModel from '../models/timeSlot.model.js';


export const checkTimeSlot = async (req, res) => {
  try {
    const { game, bookingDate } = req.body;

    if (!game) {
      return res.status(400).json({ message: "Game ID is required" });
    }
    if (!bookingDate) {
      return res.status(400).json({ message: "Booking Date is required" });
    }

    // Find the game and get maxParticipent per slot
    const gameData = await GameModel.findById(game);
    if (!gameData) {
      return res.status(404).json({ message: "Game not found" });
    }
    const maxParticipent = gameData.maxParticipent;

    // Get all time slots
    const timeSlots = await TimeSlotModel.find();

    // Get booked slots for the given game and date
    const bookedSlots = await BookingModel.aggregate([
      {
        $match: {
          game: game, // Match the selected game
          bookingDate: bookingDate, // Match the selected date
        },
      },
      {
        $group: {
          _id: "$timeSlot", // Group by time slot
          totalParticipants: { $sum: "$participants" }, // Sum participants per slot
        },
      },
    ]);

    // Convert bookedSlots to a map for quick lookup
    const bookedMap = {};
    bookedSlots.forEach((slot) => {
      bookedMap[slot._id] = slot.totalParticipants;
    });

    // Prepare response with available slots
    const availableSlots = timeSlots.map((slot) => {
      const bookedCount = bookedMap[slot._id] || 0; // Get booked count or default to 0
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
        discountAmount = coupon.discountType == "percentage"?  (coupon.percentageNumber / 100) * totalPrice : coupon.discount;
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

export const createBookingByClient = async (req, res) => { 
  try {
    const newBooking = new BookingModel({ ...req.body })
    await newBooking.save()
    res.status(201).json({ message: "bookig created", booking: newBooking });
  } catch (error) {
    console.error("Error in createBookingByAdmin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
export const createBookingByAdmin = async (req, res) => {
  console.log("booking Data", req.body);
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
              updatedAt: "$updatedAt"
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