const express = require('express')

const salonsController = require('../controllers/salons')

const router = express.Router()

router.post('/freehours', salonsController.freeHours)

module.exports = router