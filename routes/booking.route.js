import express from 'express'
import { checkTimeSlot, checkTotalPrice, createBookingByAdmin, getBookingBySingleDate } from '../controllers/booking.controller.js'

const router = express.Router()

router.post('/chek-slot-available' , checkTimeSlot)
router.post('/chek-price' , checkTotalPrice)
router.post('/booking-by-admin' , createBookingByAdmin) 
// router.post('/booking-by-client' , createBookingByAdmin) 
router.post('/get-by-date', getBookingBySingleDate)

export default router