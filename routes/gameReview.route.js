// CreateEvent 

import express from 'express' 
import { AddGameReview, DeleteGameReview, getGameReview } from '../controllers/gameReview.controller.js';
 
const route = express.Router()

route.post("/add",  AddGameReview); 
route.get("/all",  getGameReview); 
route.delete("/:id", DeleteGameReview);


export default route