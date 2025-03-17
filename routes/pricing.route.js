import express from 'express' 
import { createPricing, getAllPricings } from '../controllers/pricing.controller.js'

const router = express.Router()

router.post('/create', createPricing) 
router.get('/all-pricing', getAllPricings) 


export default router