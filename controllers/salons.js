const Moment = require('moment');
const MomentRange = require('moment-range');
 
const moment = MomentRange.extendMoment(Moment);

const Salon = require('../models/salon')

exports.freeHours = async (req, res, next) => {
    try {
        const salonId = req.body.salonId
        const serviceId = req.body.serviceId
        const rangeStart = moment(req.body.timeRange.start).utc()
        const rangeEnd = moment(req.body.timeRange.end).utc()

        const salon = await Salon.findOne({_id: salonId})
        if(!salon) {
            const error = new Error('selected salon not exists')
            error.statusCode = 404
            throw error
        }

        const [ startDayOfWeek ] = salon.openingHours.filter(day => {
            return day.name.toLowerCase() === rangeStart.format('dddd').toLowerCase()
        })

        const [ endDayOfWeek ] = salon.openingHours.filter(day => {
            return day.name.toLowerCase() === rangeEnd.format('dddd').toLowerCase()
        })

        if(!startDayOfWeek || !endDayOfWeek) {
            const error = new Error('salon is close in selected day')
            error.statusCode = 500
            throw error
        }

        if((rangeStart.format("HH:mm") < startDayOfWeek.open || rangeStart.format("HH:mm") > startDayOfWeek.close) || (rangeEnd.format("HH:mm") > endDayOfWeek.close || rangeEnd.format("HH:mm") < endDayOfWeek.open)) {
            const error = new Error('salon is close in selected range')
            error.statusCode = 500
            throw error
        }

        const [ service ] = salon.services.filter(service => {
            return service._id.toString() === serviceId
        })

        if(!service) {
            const error = new Error('selected service not exists')
            error.statusCode = 500
            throw error
        }

        const duration = service.duration
        if(rangeEnd.diff(rangeStart, 'minutes') < duration) {
            const error = new Error('range is too short for selected service')
            error.statusCode = 500
            throw error
        }

        const mappedCrew = salon.crew.map(worker => {
            const filteredSchedule = worker.schedule.filter((task) => {
                let taskStart = moment(task.start).utc()
                let taskEnd = moment(task.end).utc()

                if ( taskStart.isSameOrAfter(rangeEnd) || taskEnd.isSameOrBefore(rangeStart) ) return false
                return true
            })

            filteredSchedule.sort((a, b) => ( moment(a.start).isAfter(moment(b.start)) ) ? 1 : (moment(b.start).isAfter(moment(a.start))) ? -1 : 0)

            return {
                id: worker._id,
                schedule: filteredSchedule
            }
        })

        let freeHours = []
        rangeEnd.subtract(duration, 'minutes')
        mappedCrew.forEach(worker => {
            if(!worker.schedule.length) {
                let range = moment.range(rangeStart, rangeEnd)
                freeHours.push({
                    workerId: worker.id,
                    startHours: Array.from(range.by('minutes', {step: 15}))
                }) 
            } else {
                let start = rangeStart
                let freeTime = []
                for(let i = 0; i <= worker.schedule.length; i++) {
                    
                    let end = worker.schedule.length > i ? moment(worker.schedule[i].start).utc() : rangeEnd.add(duration, 'minutes')
                    
                    if (end.diff(start, 'minutes') >= duration) {
                        let range = moment.range(start, end.subtract(duration, 'minutes'))
                        freeTime = freeTime.concat(Array.from(range.by('minutes', {step: 15})))
                    }
                    
                    if (i < worker.schedule.length) start = moment(worker.schedule[i].end).utc()
                }
                freeHours.push({
                    workerId: worker.id,
                    startHours: freeTime
                }) 
            }
        })

        res.status(200).json({
            message: 'free hours returned',
            freeHours: freeHours
        })
    }
    catch (e) {
        next(e)
    }
}

exports.confirmReservation = async (req, res, next) => {
    try {
        const salonId = req.body.salonId
        const serviceId = req.body.serviceId
        const workerId = req.body.workerId
        const startHour = moment(req.body.startHour).utc()
        const userId = req.body.customerId

        const salon = await Salon.findOne({_id: salonId})
        if(!salon) {
            const error = new Error('selected salon not exists')
            error.statusCode = 404
            throw error
        }

        const [ service ] = salon.services.filter(service => {
            return service._id.toString() === serviceId
        })
        if(!service) {
            const error = new Error('selected service not exists')
            error.statusCode = 500
            throw error
        }

        const [ worker ] = salon.crew.filter(worker => {
            return worker._id.toString() === workerId
        })
        if(!worker) {
            const error = new Error('selected worker not exists')
            error.statusCode = 500
            throw error
        }

        const endHour = startHour.clone().add(service.duration, 'minutes')
        const checkSchedule = worker.schedule.filter(task => {
            if(endHour.isSameOrBefore(moment(task.start).utc()) || startHour.isSameOrAfter(moment(task.end).utc())) return false
            else return true
        })
        if(checkSchedule.length > 0) {
            const error = new Error('selected hour is no longer free')
            error.statusCode = 500
            throw error
        }

        worker.schedule.push({
            customer: userId,
            service: serviceId,
            start: startHour,
            end: endHour
        })

        const updatedSalon = await salon.save()

        res.status(200).json({
            message: 'successfully reserved'
        })
    }
    catch (e) {
        next(e)
    }
}