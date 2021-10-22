const Moment = require('moment');
const MomentRange = require('moment-range');
 
const moment = MomentRange.extendMoment(Moment);

const Salon = require('../models/salon')

exports.freeHours = async (req, res, next) => {
    try {
        const salonId = req.body.salonId
        const rangeStart = moment(req.body.timeRange.start)
        const rangeEnd = moment(req.body.timeRange.end)
        const duration = req.body.timeRange.duration

        if(rangeEnd.diff(rangeStart, 'minutes') < duration) {
            const error = new Error('selected range is too short')
            error.statusCode = 500
            throw error
        }

        const salon = await Salon.findOne({_id: salonId})
        if(!salon) {
            const error = new Error('selected salon not exists')
            error.statusCode = 404
            throw error
        }

        const mappedCrew = salon.crew.map(worker => {
            const filteredSchedule = worker.schedule.filter((task) => {
                let taskStart = moment(task.start)
                let taskEnd = moment(task.end)

                if ( taskStart.isSameOrAfter(rangeEnd) || taskEnd.isSameOrBefore(rangeStart) ) return false
                return true
            })

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
                    freeTime: Array.from(range.by('minutes', {step: 15}))
                }) 
            } else {
                let start = rangeStart
                let freeTime = []
                for(let i = 0; i <= worker.schedule.length; i++) {
                    
                    let end = worker.schedule.length > i ? moment(worker.schedule[i].start) : rangeEnd
                    
                    console.log('====' + i)
                    console.log(start)
                    console.log(end)
                    
                    if (end.diff(start, 'minutes') >= duration) {
                        let range = moment.range(start, end.subtract(duration, 'minutes'))
                        freeTime = freeTime.concat(Array.from(range.by('minutes', {step: 15})))
                    }
                    
                    if (i < worker.schedule.length) start = moment(worker.schedule[i].end)
                }
                freeHours.push({
                    workerId: worker.id,
                    freeTime: freeTime
                }) 
            }
            //if(moment(worker.schedule[0].start).diff(start, 'minutes') >= duration) freeHours.push(worker.schedule[0].start)
        })
        
        // let freeHours = []
        // crew.forEach(worker => {
        //     for(let i = 0; i < worker.schedule.length - 1; i++) {
        //         if(moment(worker.schedule[i].start).isSame(moment(timeRange.day), 'day')) {
        //             const nextTaskStart = moment(worker.schedule[i + 1].start)
        //             let taskStart = moment(worker.schedule[i].end)
        //             while (nextTaskStart.diff(taskStart, 'minutes') >= timeRange.duration) {
        //                 freeHours.push({
        //                     workerId: worker.workerId,
        //                     start: taskStart
        //                 })
        //                 taskStart = moment(taskStart).add(15, 'm').toDate()
        //             }
        //         }
        //     }
        // })

        res.status(200).json({
            message: 'new salon created',
            freeHours: freeHours
        })
    }
    catch (e) {
        next(e)
    }
}