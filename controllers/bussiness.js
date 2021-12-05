const Salon = require('../models/salon')

exports.createSalon = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId;

        if(!isAuth) {
            const error = new Error("user not authenticated");
            error.statusCode = 401;
            throw error;
        }

        const owner = userId
        const name = req.body.name
        const address = req.body.address
        const contact = req.body.contact
        const description = req.body.description
        const type = req.body.type
        const city = req.body.type
        const services = req.body.services
        const crew = req.body.crew
        const openingHours = req.body.openingHours

        const salon = new Salon({
            owner: owner,
            name: name,
            address: address,
            contact: contact,
            description: description,
            type: type,
            city: city,
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