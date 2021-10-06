const User = require('../models/user')

exports.signUp = async ( req, res, next) => {
    try {
        const email = req.body.email
        const emailExist = await User.findOne({email: email})
        if(emailExist) {
            const error = new Error('email already exists in database')
            error.statusCode = 405
            throw error
        }

        const password = req.body.password
        const fullname = req.body.fullname
        const birthdate = req.body.birthdate
        const phone = req.body.phone
        const role = req.body.role

        const user = new User({
            email: email,
            password: password,
            fullname: fullname,
            birthdate: birthdate,
            phone: phone,
            role: role,
        })

        const newUser = await user.save()
        if(!newUser) {
            const error = new Error('creating new user failed')
            error.statusCode = 404
            throw error
        }

        res.status(201).json({
            message: 'new user created',
            user: newUser
        })
    } catch (e) {
        next(e)
    }
}