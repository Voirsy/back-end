const express = require('express')

const salonsController = require('../controllers/salons')

const isAuth = require('../middleware/auth')

const router = express.Router()

router.post('/', salonsController.getSalons)
router.get('/:id', salonsController.getSalon)
router.post('/freehours', salonsController.freeHours)
router.post('/reservation', isAuth, salonsController.confirmReservation)
router.post('/rating', isAuth, salonsController.addRating)
router.delete('/rating', isAuth, salonsController.deleteRating)

module.exports = router