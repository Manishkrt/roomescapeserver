import express from 'express'
import multer from 'multer'
import { addBanner, getBanner } from '../controllers/offerBanner.controller.js'
const upload  = multer()

const router = express.Router()

router.post('/add', upload.single('image'), addBanner)
router.get('/',  getBanner)

export default router