import express from 'express'
import { CreateQuery, GetEventQuery } from '../controllers/eventQuery.controller.js'

const route = express.Router()

route.post('/add-event-query', CreateQuery)
route.get('/all-event-query', GetEventQuery) 


export default route