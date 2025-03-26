import express from 'express'
import { checkTimeSlot, checkTotalPrice, createBookingByAdmin, createBookingByClient, getBookingBySingleDate, phonePePaymentCallback, phonePePaymentredirect } from '../controllers/booking.controller.js'

const router = express.Router()

router.post('/chek-slot-available' , checkTimeSlot)
router.post('/chek-price' , checkTotalPrice) 
router.post('/booking-by-admin' , createBookingByAdmin) 
router.post('/get-by-date', getBookingBySingleDate)


router.post('/booking-by-client' , createBookingByClient) 
router.post('/phone-pay/redirect/:txnId' , phonePePaymentredirect) 
router.post('/phone-pay/callback' , phonePePaymentCallback) 

export default router   