const moment = require('moment');

const Salon = require('../models/salon')
const City = require('../models/city')
const Category = require('../models/category');

exports.createSalon = async (req, res, next) => {
    try {
        const isAuth = req.isAuth
        const userId = req.userId

        if(!isAuth) {
            const error = new Error("user not authenticated");
            error.statusCode = 401;
            throw error;
        }

        const city = req.body.city
        const findCity = await City.findOne({ _id: city })
        if(!findCity) {
            const error = new Error("can not find city with selected id");
            error.statusCode = 404;
            throw error;
        }

        const categories = await Category.find().select('_id')
        const mappedCategories = await categories.map(category => {
            return category._id.toString()
        })
        
        const type = req.body.type
        const checkType = await type.filter(id => {
            return !mappedCategories.includes(id)
        })

        if(checkType.length > 0) {
            const error = new Error("can not find category with selected id");
            error.statusCode = 404;
            throw error;
        }

        const owner = userId
        const name = req.body.name
        const address = req.body.address
        const contact = req.body.contact
        const portfolio = req.body.portfolio
        const image = req.body.image
        const description = req.body.description
        const services = req.body.services || []
        const crew = req.body.crew || []
        const openingHours = req.body.openingHours || []

        const salon = new Salon({
            owner: owner,
            name: name,
            address: address,
            contact: contact,
            image: image,
            portfolio: portfolio,
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

exports.updateSalon = async (req, res, next) => {
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
            error.statusCode = 403;
            throw error;
        }

        const city = req.body.city
        const findCity = await City.findOne({ _id: city })
        if(!findCity) {
            const error = new Error("can not find city with selected id");
            error.statusCode = 404;
            throw error;
        }

        const categories = await Category.find().select('_id')
        const mappedCategories = await categories.map(category => {
            return category._id.toString()
        })
        
        const type = req.body.type
        const checkType = await type.filter(id => {
            return !mappedCategories.includes(id)
        })

        if(checkType.length > 0) {
            const error = new Error("can not find category with selected id");
            error.statusCode = 404;
            throw error;
        }

        const name = req.body.name
        const address = req.body.address
        const contact = req.body.contact
        const description = req.body.description
        const openingHours = req.body.openingHours
        const image = req.body.image
        const portfolio = req.body.portfolio

        if(name) salon.name = name
        if(address) salon.address = address
        if(contact) salon.contact = contact
        if(description) salon.description = description
        if(type) salon.type = type
        if(city) salon.city = city
        if(openingHours) salon.openingHours = openingHours
        if(image) salon.image = image
        if(portfolio) salon.portfolio = portfolio

        const updatedSalon = await salon.save()
        if(!updatedSalon) {
            const error = new Error('updating salon data failed')
            error.statusCode = 400
            throw error
        }

        res.status(200).json({
            message: 'salon updated',
            salon: updatedSalon
        })
    }
    catch (e) {
        next(e)
    }
}

exports.deleteSalon = async (req, res, next) => {
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
            error.statusCode = 403;
            throw error;
        }

        const deleteSalon = await Salon.deleteOne({ _id: salonId })
        if(!deleteSalon) {
            const error = new Error('deleting salon failed')
            error.statusCode = 400
            throw error
        }

        res.status(200).json({
            message: 'salon deleted',
            salon: deleteSalon
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

        const salons = await Salon.find({ owner: userId }).populate('type city')
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
                type: salon.type.map(category => { return category.name }),
                city: salon.city.name,
                image: salon.image
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

        const salon = await Salon.findOne({ _id: salonId }).populate('type city')
        if(!salon) {
            const error = new Error("can not find salon with selected id");
            error.statusCode = 404;
            throw error;
        }

        if(salon.owner.toString() !== userId.toString()) {
            const error = new Error("user is not owner of selected salon");
            error.statusCode = 403;
            throw error;
        }

        const mappedSalon = {         
            _id: salon._id.toString(),
            name: salon.name,
            address: salon.address,
            city: salon.city.name,
            description: salon.description,
            openingHours: salon.openingHours.map(day => {
                return {
                    name: day.name,
                    open: day.open,
                    close: day.close
                }
            }),
            phone: salon.contact.phone,
            services: salon.services,
            crew: salon.crew.map(worker => {
                return {
                    _id: worker._id.toString(),
                    imageUrl: worker.imageUrl,
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
            error.statusCode = 403;
            throw error;
        }

        let scheduleArray = []
        salon.crew.forEach(worker => {
            worker.schedule.forEach(task => {
                scheduleArray.push({
                    worker: worker.name,
                    avatar: worker.imageUrl,
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
            error.statusCode = 403;
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
            error.statusCode = 403;
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
            error.statusCode = 403;
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
        const imageUrl = req.body.imageUrl

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
            error.statusCode = 403;
            throw error;
        }

        const newCrewMember = {
            name: name,
            imageUrl: imageUrl,
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
            error.statusCode = 403;
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
        const imageUrl = req.body.imageUrl

        if(name) crewMember.name = name
        if(imageUrl) crewMember.imageUrl = imageUrl

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
            error.statusCode = 403;
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