const express = require('express')

const salonsController = require('../controllers/salons')

const isAuth = require('../middleware/auth')

const router = express.Router()

router.post('/freehours', salonsController.freeHours)
router.post('/reservation', isAuth, salonsController.confirmReservation)

module.exports = router