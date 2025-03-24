import express from 'express'
import multer from 'multer'
import { addBanner, deleteOfferBanner, getBanner } from '../controllers/offerBanner.controller.js'
const upload  = multer()

const router = express.Router()

router.post('/add', upload.single('image'), addBanner)
router.get('/',  getBanner)
router.delete('/:id',  deleteOfferBanner)

export default router   