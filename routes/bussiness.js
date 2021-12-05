const express = require('express')

const bussinessController = require('../controllers/bussiness')

const isAuth = require('../middleware/auth')
const isBussiness = require('../middleware/bussiness')

const router = express.Router()

router.post('/salon', isAuth, isBussiness, bussinessController.createSalon)

module.exports = router