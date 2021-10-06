const express = require('express')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth')

const port = process.env.PORT || 8080
const app = express()

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({
        error: { 
            message: message,
            status: status
        },
        data: data
    })
})

mongoose.connect('mongodb+srv://studiesUser:r6MsmhxSbo5yRgPF@studies.f2jst.mongodb.net/voirsy?retryWrites=true&w=majority')
.then(result => {
    app.listen(port)
})
.catch(err => console.log(err))