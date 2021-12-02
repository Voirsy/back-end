const User = require("../models/user")

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
        avatarUrl: loadedUser.avatarUrl
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
        error.statusCode = 404;
        throw error;
      }
  
      res.status(201).json({
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

      if(user.email !== req.body.email) {
          const emailExist = await User.findOne({ email: email });
          if (emailExist) {
              const error = new Error("email already exists in database");
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
  
      
  
      const updatedUser = await user.save();
      if (!updatedUser) {
        const error = new Error("updating user data failed");
        error.statusCode = 404;
        throw error;
      }
  
      res.status(201).json({
        message: "user data updated",
        user: updatedUser,
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

      const deleteUser = await User.deleteOne(user)
  
      res.status(201).json({
        message: "user profile deleted",
        user: deleteUser,
      });
  } catch (e) {
    next(e);
  }
}