const User = require('../models/user')

exports.checkEmail = async (req, res, next) => {
    try {
        const email = req.body.email
        const emailExist = await User.findOne({email: email})
        if(!emailExist) {
            const error = new Error('email not exists in database')
            error.statusCode = 404
            throw error
        }

        res.status(200).json({
            email: email,
            exist: true
        })
    } catch (e) {
        next(e)
    }
}

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
        const language = req.body.language
        const currency = req.body.currency

        const user = new User({
            email: email,
            password: password,
            fullname: fullname,
            birthdate: birthdate,
            phone: phone,
            role: role,
            language: language,
            currency: currency
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

exports.signIn = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        
        const loadedUser = await User.findOne({email: email})
        
        if(!loadedUser) {
            const error = new Error('user with that email not exists')
            error.statusCode = 404
            throw error
        }
        
        const isEqual = bcrypt.compare(password, user.password)
            
        if(!isEqual) {
            const error = new Error('wrong password')
            error.statusCode = 401
            throw error
        }
            
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
            role: loadedUser.role
        }, 'uniwersytetkazimierzawielkiegowbydgoszczy', {
            expiresIn: '1h'
        })
        
        res.status(200).json({
            token: token,
            user: {
                id: loadedUser._id.toString(),
                email: loadedUser.email,
                fullname: loadedUser.fullname,
                birthdate: loadedUser.birthdate,
                phone: loadedUser.phone,
                role: loadedUser.role,
                language: loadedUser.language,
                currency: loadedUser.currency
            }
        })
    } catch (e) {
        next(e)
    }
}