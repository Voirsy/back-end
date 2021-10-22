const express = require('express')

const bussinessController = require('../controllers/bussiness')

const router = express.Router()

router.post('/salon', bussinessController.createSalon)

module.exports = router