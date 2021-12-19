const Salon = require('../models/salon')
const moment = require('moment');

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

exports.getSalonInfo = async (req, res, next) => {
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

exports.getSalonSchedule = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id
        const now = moment().utc()

        if(!isAuth) {
            const error = new Error("user not authenticated");
            error.statusCode = 401;
            throw error;
        }

        const salon = await Salon.findOne({ _id: salonId }).populate('crew.schedule.customer crew.schedule.service')
        if(!salon) {
            const error = new Error("can not find salon with selected id");
            error.statusCode = 404;
            throw error;
        }

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        let scheduleArray = []
        salon.crew.forEach(worker => {
            worker.schedule.forEach(task => {
                scheduleArray.push({
                    worker: worker.name,
                    customer: task.customer.fullname,
                    phone: task.customer.phone,
                    start: task.start,
                    end: task.end
                })
            })
        })

        const filteredSchedule = await scheduleArray.filter(task => {
            const end = moment(task.end).utc()
            return end.isAfter(now)
        })

        res.status(200).json({
            message: 'salon schedule returned',
            salon: filteredSchedule
        })
    } catch (e) {
        next(e)
    }
}

exports.addService = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id

        const name = req.body.name
        const price = req.body.price
        const duration = req.body.duration
        const description = req.body.description

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

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        const newService = {
            name: name,
            price: price,
            duration: duration,
            description: description
        }

        salon.services.push(newService)
        const updatedSalon = await salon.save()
        if(!updatedSalon) {
            const error = new Error("updating salon data failed");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'service successfully created',
            services: updatedSalon.services
        })
    } catch (e) {
        next(e)
    }
}

exports.updateService = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id
        const serviceId = req.body.serviceId

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

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        const [ service ] = await salon.services.filter(service => {
            return service._id.toString() === serviceId
        })

        if(!service) {
            const error = new Error("can not find service");
            error.statusCode = 404;
            throw error;
        }

        const name = req.body.name
        const price = req.body.price
        const duration = req.body.duration
        const description = req.body.description

        if(name) service.name = name
        if(price) service.price = price
        if(duration) service.duration = duration
        if(description) service.description = description

        const updatedSalon = await salon.save()
        if(!updatedSalon) {
            const error = new Error("updating salon data failed");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'service successfully updated',
            services: updatedSalon.services
        })
    } catch (e) {
        next(e)
    }
}

exports.deleteService = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id
        const serviceId = req.body.serviceId

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

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        const services = await salon.services.filter(service => {
            return service._id.toString() !== serviceId
        })

        if(!services) {
            const error = new Error("error when deleting a service");
            error.statusCode = 400;
            throw error;
        }

        salon.services = services
        const updatedSalon = await salon.save()
        if(!updatedSalon) {
            const error = new Error("updating salon data failed");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'service successfully deleted',
            services: updatedSalon.services
        })
    } catch (e) {
        next(e)
    }
}

exports.addCrewMember = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id

        const name = req.body.name

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

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        const newCrewMember = {
            name: name,
            schedule: []
        }

        salon.crew.push(newCrewMember)
        const updatedSalon = await salon.save()
        if(!updatedSalon) {
            const error = new Error("updating salon data failed");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'crew member successfully created',
            crew: updatedSalon.crew
        })
    } catch (e) {
        next(e)
    }
}

exports.updateCrewMember = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id
        const crewId = req.body.crewId

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

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        const [ crewMember ] = await salon.crew.filter(crewMember => {
            return crewMember._id.toString() === crewId
        })

        if(!crewMember) {
            const error = new Error("can not find crew member");
            error.statusCode = 404;
            throw error;
        }

        const name = req.body.name

        if(name) crewMember.name = name

        const updatedSalon = await salon.save()
        if(!updatedSalon) {
            const error = new Error("updating salon data failed");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'crew member successfully updated',
            crew: updatedSalon.crew
        })
    } catch (e) {
        next(e)
    }
}

exports.deleteCrewMember = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId
        const salonId = req.params.id
        const crewId = req.body.crewId

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

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 404;
            throw error;
        }

        const crew = await salon.crew.filter(crewMember => {
            return crewMember._id.toString() !== crewId
        })

        if(!crew) {
            const error = new Error("error when deleting a crew member");
            error.statusCode = 400;
            throw error;
        }

        salon.crew = crew
        const updatedSalon = await salon.save()
        if(!updatedSalon) {
            const error = new Error("updating salon data failed");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'crew member successfully deleted',
            services: updatedSalon.crew
        })
    } catch (e) {
        next(e)
    }
}