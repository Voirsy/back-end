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

exports.getSalons = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId;

        if(!isAuth) {
            const error = new Error("user not authenticated");
            error.statusCode = 401;
            throw error;
        }

        const salons = await Salon.find({ owner: userId })
        if(!salons) {
            const error = new Error("error when searching for salons");
            error.statusCode = 400;
            throw error;
        }

        const mappedSalons = salons.map(salon => {
            return {
                _id: salon._id.toString(),
                name: salon.name,
                address: salon.address,
                type: salon.type,
                city: salon.city
            }
        })

        res.status(200).json({
            message: 'salons owned by user returned',
            salons: mappedSalons
        })
    } catch (e) {
        next(e)
    }
}

exports.getSalon = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id

        if(!isAuth) {
            const error = new Error("user not authenticated");
            error.statusCode = 401;
            throw error;
        }

        const salon = await Salon.findOne({ _id: salonId })
        if(!salon) {
            const error = new Error("can not find salon with selected id");
            error.statusCode = 404;
            throw error;
        }

        console.log(salon.owner)

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        const mappedSalon = {         
            _id: salon._id.toString(),
            name: salon.name,
            address: salon.address,
            city: salon.city,
            type: salon.type,
            description: salon.description,
            openingHours: salon.openingHours.map(day => {
                return {
                    name: day.name,
                    open: day.open,
                    close: day.close
                }
            }),
            contact: salon.contact,
            services: salon.services,
            crew: salon.crew.map(worker => {
                return {
                    _id: worker._id.toString(),
                    name: worker.name,
                }
            })
        }

        res.status(200).json({
            message: 'salon returned',
            salon: mappedSalon
        })
    } catch (e) {
        next(e)
    }
}