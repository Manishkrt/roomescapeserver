import express from 'express';
import { createGame, getAllGames, updateGame, deleteGame, UpdateBookingAvailable, UpdateGameStatus, getAllClientsGames, } from '../controllers/game.controller.js';
import multer from 'multer'; 
const upload = multer()
// const upload = multer({ dest: 'uploads/' })


const router = express.Router();

// router.post('/create',   createGame);
router.post('/create', upload.single('thumbnail'), upload.single('thumbnail'), createGame);
router.get('/all', getAllGames);

router.put('/update/:id', upload.fields([{name :'thumbnail'},{name :'bgImage'}]),  updateGame);
router.delete('/remove/:id', deleteGame);
router.post('/update-booking-available/:id', UpdateBookingAvailable);
router.post('/update-game-status/:id', UpdateGameStatus);
router.get('/', getAllClientsGames);

export default router;
