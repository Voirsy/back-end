const express = require('express')

const bussinessController = require('../controllers/bussiness')

const isAuth = require('../middleware/auth')
const isBussiness = require('../middleware/bussiness')

const router = express.Router()

router.post('/salon', isAuth, isBussiness, bussinessController.createSalon)
router.get('/salons', isAuth, isBussiness, bussinessController.getSalons)
router.get('/salon/:id/info', isAuth, isBussiness, bussinessController.getSalonInfo)
router.get('/salon/:id/schedule', isAuth, isBussiness, bussinessController.getSalonSchedule)
//service
router.post('/salon/:id/service', isAuth, isBussiness, bussinessController.addService)
router.patch('/salon/:id/service', isAuth, isBussiness, bussinessController.updateService)
router.delete('/salon/:id/service', isAuth, isBussiness, bussinessController.deleteService)
//crew
router.post('/salon/:id/crew', isAuth, isBussiness, bussinessController.addCrewMember)
router.patch('/salon/:id/crew', isAuth, isBussiness, bussinessController.updateCrewMember)
router.delete('/salon/:id/crew', isAuth, isBussiness, bussinessController.deleteCrewMember)

module.exports = router