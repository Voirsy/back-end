const User = require("../models/user")
const Salon = require('../models/salon')

const bcrypt = require("bcryptjs");

exports.getUserData = async (req, res, next) => {
  try {
    const userId = req.userId;

    const loadedUser = await User.findOne({ _id: userId });

    if (!loadedUser) {
      const error = new Error("user with that email not exists");
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({
      user: {
        id: loadedUser._id.toString(),
        email: loadedUser.email,
        fullname: loadedUser.fullname,
        birthdate: loadedUser.birthdate,
        phone: loadedUser.phone,
        role: loadedUser.role,
        language: loadedUser.language,
        currency: loadedUser.currency,
        avatarUrl: loadedUser.avatarUrl,
        favorites: loadedUser.favorites
      },
    });
    
  } catch (e) {
    next(e);
  }
}

exports.updateUserPassword = async (req, res, next) => {
  try {
      if(!req.isAuth) {
          const error = new Error("user not authenticated");
          error.statusCode = 401;
          throw error;
      }

      const user = await User.findOne({ _id: req.userId })
      if(!user) {
          const error = new Error("user not found");
          error.statusCode = 404;
          throw error;
      }

      const isEqual = await bcrypt.compare(req.body.oldPassword, user.password);

      if (!isEqual) {
        const error = new Error("wrong password");
        error.statusCode = 401;
        throw error;
      }

      const password = await bcrypt.hash(req.body.newPassword, 10);
      user.password = password;

      const updatedUser = await user.save();
      if (!updatedUser) {
        const error = new Error("updating user password failed");
        error.statusCode = 400;
        throw error;
      }
  
      res.status(200).json({
        message: "user data updated"
      });
  } catch (e) {
    next(e);
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
      if(!req.isAuth) {
          const error = new Error("user not authenticated");
          error.statusCode = 401;
          throw error;
      }

      const user = await User.findOne({ _id: req.userId })
      if(!user) {
          const error = new Error("user not found");
          error.statusCode = 404;
          throw error;
      }

      const email = req.body.email;
      if(email && (user.email !== email)) {
          const alreadyExist = await User.findOne({ email: email });
          if (alreadyExist) {
              const error = new Error("your new email already exists in database");
              error.statusCode = 405;
              throw error;
          } else user.email = req.body.email
      }

      const fullname = req.body.fullname
      const birthdate = req.body.birthdate
      const phone = req.body.phone
      const avatarUrl = req.body.avatarUrl
  
      if (fullname) user.fullname = fullname;
      if (birthdate) user.birthdate = birthdate;
      if (phone) user.phone = phone;
      if (avatarUrl) user.avatarUrl = avatarUrl;
  
      const updatedUser = await user.save()
      if (!updatedUser) {
        const error = new Error("updating user data failed");
        error.statusCode = 400;
        throw error;
      }
  
      res.status(200).json({
        message: "user data updated",
        user: {
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            fullname: updatedUser.fullname,
            birthdate: updatedUser.birthdate,
            phone: updatedUser.phone,
            role: updatedUser.role,
            language: updatedUser.language,
            currency: updatedUser.currency,
            avatarUrl: updatedUser.avatarUrl,
            favorites: updatedUser.favorites
        },
      });
  } catch (e) {
    next(e);
  }
}

exports.deleteProfile = async (req, res, next) => {
  try {
      if(!req.isAuth) {
          const error = new Error("user not authenticated");
          error.statusCode = 401;
          throw error;
      }

      const user = await User.findOne({ _id: req.userId })
      if(!user) {
          const error = new Error("user not found");
          error.statusCode = 404;
          throw error;
      }

      const deleteSalons = await Salon.deleteMany({ owner: user })
      const deleteUser = await User.deleteOne(user)
  
      res.status(200).json({
        message: "user profile deleted",
        user: deleteUser,
      });
  } catch (e) {
    next(e);
  }
}

exports.getFavorites = async (req, res, next) => {
  try {
      if(!req.isAuth) {
          const error = new Error("user not authenticated");
          error.statusCode = 401;
          throw error;
      }

      const user = await User.findOne({ _id: req.userId }).select('favorites -_id')
          .populate({
              path: 'favorites',
              select: '_id name imageUrl city type address owner rating',
              populate: [{
                  path: 'type',
                  model: 'Category'
              }, {
                  path: 'city',
                  model: 'City'
              }]
          })

      if(!user) {
          const error = new Error("user not found");
          error.statusCode = 404;
          throw error;
      }
  
      res.status(200).json({
        message: "user favorites returned",
        favorites: user.favorites.map(favorite => ({
            _id: favorite._id,
            address: favorite.address,
            city: favorite.city.name,
            imageUrl: favorite.imageUrl,
            name: favorite.name,
            type: favorite.type.map(el => el.name),
            rating: favorite.rating,
        }))
      });
  } catch (e) {
    next(e);
  }
}

exports.addToFavorites = async (req, res, next) => {
  try {
    const salonId = req.body.salonId

    if(!req.isAuth) {
        const error = new Error("user not authenticated");
        error.statusCode = 401;
        throw error;
    }

    const user = await User.findOne({ _id: req.userId })
    if(!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
    }

    const salon = await Salon.findOne({ _id: salonId })
    if(!salon) {
        const error = new Error("salon not found");
        error.statusCode = 404;
        throw error;
    }

    const alreadyFavorite = await user.favorites.filter(salon => {
      return salon.toString() === salonId;
    })
    if(alreadyFavorite.length > 0) {
      const error = new Error("salon already is favorite");
      error.statusCode = 409;
      throw error;
    }

    user.favorites.push(salonId)
    const updatedUser = await user.save();
    if (!updatedUser) {
      const error = new Error("updating user data failed");
      error.statusCode = 400;
      throw error;
    }

    salon.popularity += 1
    const updatedSalon = await salon.save();
    if (!updatedSalon) {
      const error = new Error("updating salon data failed");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      message: "salon successfully added to favorites"
    });
  } catch (e) {
    next(e);
  }
}

exports.deleteFromFavorites = async (req, res, next) => {
  try {
    const salonId = req.body.salonId

    if(!req.isAuth) {
        const error = new Error("user not authenticated");
        error.statusCode = 401;
        throw error;
    }

    const user = await User.findOne({ _id: req.userId })
    if(!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
    }

    const salon = await Salon.findOne({ _id: salonId })
    if(!salon) {
        const error = new Error("salon not found");
        error.statusCode = 404;
        throw error;
    }

    const findSalon = await user.favorites.filter(salon => {
      return salon.toString() === salonId;
    })
    if(findSalon.length < 1) {
      const error = new Error("salon not found in favorite list");
      error.statusCode = 409;
      throw error;
    }

    const newFavorites = await user.favorites.filter(salon => {
      return salon.toString() !== salonId;
    })

    user.favorites = newFavorites
    const updatedUser = await user.save();
    if (!updatedUser) {
      const error = new Error("updating user data failed");
      error.statusCode = 400;
      throw error;
    }

    salon.popularity -= 1
    const updatedSalon = await salon.save();
    if (!updatedSalon) {
      const error = new Error("updating salon data failed");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      message: "salon successfully removed from favorites"
    });
  } catch (e) {
    next(e);
  }
}