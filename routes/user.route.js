import express from 'express'
import { createUser, sendOTP, userDetails, userLogin, userVerify } from '../controllers/user.controller.js'
import { userAuth, userLoginMiddleware } from '../middlewares/user.middleware.js'

const router = express.Router()

router.post('/create', createUser)
router.post('/send-otp', sendOTP)
router.post('/verify', userVerify)
router.post('/login', userLoginMiddleware, userLogin)
router.get('/user-details', userAuth, userDetails)


export default router