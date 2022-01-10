const express = require('express')

const router = express.Router()

const dataController = require('../controllers/appData')

router.get('/city', dataController.getCity)
router.get('/category', dataController.getCategory)

module.exports = router