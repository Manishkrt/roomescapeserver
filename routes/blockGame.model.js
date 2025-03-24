import express from 'express'
import { addBlockGames, getAllBlockGame } from '../controllers/blockGame.controller.js'
 
const router = express.Router()

router.post('/add' , addBlockGames) 
router.get('/' , getAllBlockGame) 

export default router