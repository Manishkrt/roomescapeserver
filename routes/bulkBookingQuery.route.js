import express from 'express' 
import { CreateQuery, GetQuery, UpdateRespond } from '../controllers/bulkBookingQuery.controller.js'

const route = express.Router()

route.post('/add-event-query', CreateQuery)
route.get('/all-event-query', GetQuery) 
route.post('/update-response/:id', UpdateRespond) 


export default route 