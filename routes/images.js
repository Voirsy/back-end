const express = require('express')

const imagesController = require('../controllers/images')

const isAuth = require('../middleware/auth')

const router = express.Router()

router.post('/image-upload', isAuth, imagesController.uploadImages)

module.exports = router