const Salon = require('../models/salon')

exports.createSalon = async (req, res, next) => {
    try {
        const name = req.body.name
        const address = req.body.address
        const contact = req.body.contact
        const about = req.body.about
        const category = req.body.category
        const services = req.body.services
        const crew = req.body.crew
        const openingHours = req.body.openingHours

        const salon = new Salon({
            name: name,
            address: address,
            contact: contact,
            about: about,
            category: category,
            services: services,
            crew: crew,
            openingHours: openingHours
        })

        const newSalon = await salon.save()
        if(!newSalon) {
            const error = new Error('creating new salon failed')
            error.statusCode = 400
            throw error
        }

        res.status(201).json({
            message: 'new salon created',
            salon: newSalon
        })
    }
    catch (e) {
        next(e)
    }
}