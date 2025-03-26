import express from 'express'  
import { cancelBooking, GetCanceledBooking } from '../controllers/cancelBooking.controller.js'
const route = express.Router()
 
route.get('/cancel/:bookingId', cancelBooking)
route.get('/all', GetCanceledBooking)

export default route