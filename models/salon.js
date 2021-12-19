const mongoose = require('mongoose')
const Schema = mongoose.Schema

const salonSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    type: [{
        type: String,
        required: true,
        enum: ['hairdresser', 'barber', 'beautician', 'tatooist']
    }],
    contact: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    image: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    openingHours: [
        {
            name: {
                type: String,
                required: true,
                enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
            },
            open: {
                type: String,
                required: true
            },
            close: {
                type: String,
                required: true
            }
        }
    ],
    ratings: [
        {
            customer: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            opinion: {
                type: String,
                required: false
            }
        }
    ],
    services: [
        {
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            duration: {
                type: Number,
                required: true
            },
            description: {
                type: String,
                required: false
            }
        }
    ],
    crew: [
        {
            name: {
                type: String,
                required: true
            },
            schedule: [
                {
                    customer: {
                        type: Schema.Types.ObjectId,
                        required: true,
                        ref: 'User'
                    },
                    service: {
                        type: Schema.Types.ObjectId,
                        required: true
                    },
                    start: {
                        type: String,
                        required: true
                    },
                    end: {
                        type: String,
                        required: true
                    }
                }
            ]
        }
    ]
})

module.exports = mongoose.model('Salon', salonSchema)