const express = require('express')

const authController = require('../controllers/auth')

const isAuth = require('../middleware/auth')

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/checkemail', authController.checkEmail)
router.post('/signin', authController.signIn)

module.exports = router