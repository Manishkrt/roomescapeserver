import express from 'express';
import { createTimeSlot, getAllTimeSlots, updateTimeSlot, deleteTimeSlot,} from '../controllers/timeSlot.controller.js';


const router = express.Router();

router.post('/create', createTimeSlot);
router.get('/all', getAllTimeSlots);
router.put('/update/:id', updateTimeSlot);
router.delete('/remove/:id', deleteTimeSlot);

export default router;
