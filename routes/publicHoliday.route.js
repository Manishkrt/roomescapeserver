import express from 'express';
import { createPublicHoliday, getPublicHoliday, updatePublicHoliday, deletePublicHoliday } from '../controllers/publicHoliday.controller.js';
 

const router = express.Router(); 

router.post('/create', createPublicHoliday); 
router.get('/all', getPublicHoliday); 
router.put('/update/:id', updatePublicHoliday); 
router.delete('/remove/:id', deletePublicHoliday);

export default router;
