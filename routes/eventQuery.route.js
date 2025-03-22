import express from 'express'
import { AddEventQuery, GetEventQuery } from '../controllers/eventQuery.controller.js'

const route = express.Router()

route.post('/add', AddEventQuery) 

export default route