import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

import userRouter from './routes/user.route.js' 
import adminRouter from './routes/admin.route.js' 
import pricingRouter from './routes/pricing.route.js' 
import publicHolidayRouter from './routes/publicHoliday.route.js' 
import timeSlotRouter from './routes/timeSlot.route.js' 
import gameRouter from './routes/game.route.js' 
import blogRouter from './routes/blog.route.js' 
import bookingRouter from './routes/booking.route.js' 
import couponRouter from './routes/couponCode.route.js' 
import bulkBookingQueryRouter from './routes/bulkBookingQuery.route.js' 
import eventRouter from './routes/event.route.js' 
import eventQueryRouter from './routes/eventQuery.route.js' 
import offerBannerRouter from './routes/offerBanner.route.js' 
import blockGameRouter from './routes/blockGame.model.js' 
import GameReviewRouter from './routes/gameReview.route.js' 

dotenv.config() 
const PORT = process.env.PORT || 8000 

connectDB()
const app = express()


app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: true, // Allows all origins dynamically
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use('/api/v1/user', userRouter)  
app.use('/api/v1/admin', adminRouter)  
app.use('/api/v1/pricing', pricingRouter)  
app.use('/api/v1/public-holiday', publicHolidayRouter)  
app.use('/api/v1/time-slot', timeSlotRouter)  
app.use('/api/v1/game', gameRouter)  
app.use('/api/v1/blog', blogRouter)  
app.use('/api/v1/booking', bookingRouter)  
app.use('/api/v1/coupon', couponRouter)  
app.use('/api/v1/bulk-booking', bulkBookingQueryRouter)  
app.use('/api/v1/event', eventRouter)  
app.use('/api/v1/event-booking', eventQueryRouter)  
app.use('/api/v1/offer-banner', offerBannerRouter)  
app.use('/api/v1/block-games', blockGameRouter)  
app.use('/api/v1/game-review', GameReviewRouter)  
app.get('/', (req, res)=>{ 
    res.send('Server is running');
})



app.listen(PORT, ()=>{
    console.log(`server start on port ${PORT}`); 
})