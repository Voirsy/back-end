const express = require('express')

const profileController = require('../controllers/profile')
const isAuth = require('../middleware/auth')

const router = express.Router()

router.get('/profile', isAuth, profileController.getUserData)
router.patch('/profile', isAuth, profileController.updateProfile)
router.post('/profile', isAuth, profileController.updateUserPassword)
router.delete('/profile', isAuth, profileController.deleteProfile)

module.exports = router