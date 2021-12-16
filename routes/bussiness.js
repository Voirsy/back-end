const express = require('express')

const bussinessController = require('../controllers/bussiness')

const isAuth = require('../middleware/auth')
const isBussiness = require('../middleware/bussiness')

const router = express.Router()

router.post('/salon', isAuth, isBussiness, bussinessController.createSalon)
router.get('/salons', isAuth, isBussiness, bussinessController.getSalons)
router.get('/salon/:id/info', isAuth, isBussiness, bussinessController.getSalon)

module.exports = router