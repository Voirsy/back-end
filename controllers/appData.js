const City = require('../models/city')
const Category = require('../models/category')

exports.getCity = async (req, res, next) => {
    try {
        const cities = await City.find().sort('name')
        if(!cities) {
            const error = new Error("error when fetching cities list");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'cities available in voirsy',
            cities: cities
        })
    } catch (e) {
        next(e)
    }
}

exports.getCategory = async (req, res, next) => {
    try {
        const categories = await Category.find().sort('name')
        if(!categories) {
            const error = new Error("error when fetching category list");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            message: 'categories available in voirsy',
            categories: categories
        })
    } catch (e) {
        next(e)
    }
}