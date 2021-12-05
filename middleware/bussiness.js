const User = require("../models/user")

module.exports = async (req, res, next) => {
    try {
        const userId = req.userId

        const loadedUser = await User.findOne({ _id: userId });
        if (!loadedUser) {
            const error = new Error("selected user not found");
            error.statusCode = 404;
            throw error;
        }

        if(loadedUser.role !== "BUSINESS") {
            const error = new Error("user do not have bussiness privileges");
            error.statusCode = 401;
            throw error;
        }

        next()
    } catch (e) {
        return next(e);
    }
};