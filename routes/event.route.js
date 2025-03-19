// CreateEvent 

import express from 'express' 
import { CreateEvent, DeleteEvent, GetEvent, GetEventSingle, singleEventWithFormApplied, UpdateEvent } from '../controllers/event.controller.js'
import multer from 'multer';  

const upload = multer()

const route = express.Router()

route.post("/create", upload.single('image'), CreateEvent);
route.put("/update/:id", upload.single('image'), UpdateEvent);
route.get("/single/:id", GetEventSingle);
route.get("/with-form-applied/:id", singleEventWithFormApplied);
route.delete("/:id", DeleteEvent);
route.get("/", GetEvent);

export default route