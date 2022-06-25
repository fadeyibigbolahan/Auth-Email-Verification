const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { SECRET } = require("../config");
const nodemailer = require("nodemailer")
// const { registerValidation, loginValidation } = require('../utils/validation');

/****************************************************************************************************
REGISTRATION AUTHENTICATION => STARTS
 ***************************************************************************************************/
/**
 * @DESC To register the user (ADMIN, USER)
 */

const userRegister = async (userDets, role, verifyCode, res) => {
    try {
        // mail sender details
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: '465',
            sender: 'gmail',
            auth: {
                user: 'fadeyibi26@gmail.com',
                pass: '@igoRich23'
            }
        })

        // Validate the username
        let usernameNotTaken = await validateUsername(userDets.userName);
        if (!usernameNotTaken) {
            return res.status(400).json({
                message: `Username is already taken.`,
                success: false
            });
        }

        // Validate the email
        let emailNotRegistered = await validateEmail(userDets.email);
        if (!emailNotRegistered) {
            return res.status(400).json({
                message: `Email is already registered.`,
                success: false
            });
        }

        // Get the hashed password
        const password = await bcrypt.hash(userDets.password, 12);

        //confirmation code
        const confirmationCode = Math.floor(100000 + Math.random() * 900000) ;

        // create a new user
        const newUser = new User({
            ...userDets,
            confirmationCode,
            password,
            role
        });

        console.log(newUser)

        await newUser.save();

        // send verification mail to user
        var mailOptions = {
        from: 'fadeyibi26@gmail.com',
        to: newUser.email,
        subject: 'testing mode -verify your email',
        html: `${newUser.userName}, this is your verification code ${newUser.confirmationCode}`
        }
                
        // sending mail
        transporter.sendMail(mailOptions, function(error, info){
        if(error) {
            console.log(error)
        } else {
            console.log("verification email is sent")
        }
        })

        return res.status(201).json({
            message: "Hurry! now you have successfully registered, kindly wait for verification.",
            success: true
        });
    } catch (err) {
        // Implement logger function (winston)
        return res.status(500).json({
            message: "Unable to create your account, try again later.",
            success: false
        });
    }
};
/****************************************************************************************************
REGISTRATIONS AUTHENTICATION => ENDS
 ***************************************************************************************************/

/****************************************************************************************************
ADMIN LOGIN AUTHENTICATION => STARTS
 ***************************************************************************************************/
/**
 * @DESC To login the user (ADMIN)
 */
const adminLogin = async (userCreds, role, res) => {

    let { userName, password } = userCreds;
    //First Check if the username is in the database
    const user = await User.findOne({ userName });
    if (!user) {
        return res.status(404).json({
            message: "Username is not found. Invalid login credentials.",
            success: false
        })
    }
    // we will check the role
    if (user.role !== role) {
        return res.status(403).json({
            message: "Please make sure you are loggin in from the right account.",
            success: false
        })
    }
    // That means user is existing and trying to signin from the right account
    //Now check for the password
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        //Sign in the token and issue it to the user
        let token = jwt.sign({
            _id: user._id,
            role: user.role,
            username: user.userName,
            email: user.email
        }, SECRET, { expiresIn: "7 days" });

        let result = {
            username: user.userName,
            role: user.role,
            _id: user._id,
            email: user.email,
            token: `Bearer ${token}`,
            expiresIn: 168
        };

        return res.status(200).json({
            ...result,
            message: "Log in successful!!!",
            success: true
        });
    } else {
        return res.status(403).json({
            message: "Incorrect password",
            success: false
        })
    }
}
/****************************************************************************************************
LOGIN AUTHENTICATION => STARTS
 ***************************************************************************************************/

/****************************************************************************************************
LOGIN AUTHENTICATION => STARTS
 ***************************************************************************************************/
/**
 * @DESC To login the user (OTHER USERS APART FROM ADMIN)
 */
 const userLogin = async (userCreds, res) => {

    let { userName, password } = userCreds;
    //First Check if the username is in the database
    const user = await User.findOne({ userName });
    if (!user) {
        return res.status(404).json({
            message: "Username is not found. Invalid login credentials.",
            success: false
        })
    }
    // // we will check the role
    // if (user.role !== role) {
    //     return res.status(403).json({
    //         message: "Please make sure you are loggin in from the right account.",
    //         success: false
    //     })
    // }
    // That means user is existing and trying to signin from the right account
    //Now check for the password
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        //Sign in the token and issue it to the user
        let token = jwt.sign({
            _id: user._id,
            role: user.role,
            username: user.userName,
            email: user.email
        }, SECRET, { expiresIn: "7 days" });

        let result = {
            username: user.userName,
            role: user.role,
            _id: user._id,
            email: user.email,
            token: `Bearer ${token}`,
            expiresIn: 168
        };

        return res.status(200).json({
            ...result,
            message: "Log in successful!!!",
            success: true
        });
    } else {
        return res.status(403).json({
            message: "Incorrect password",
            success: false
        })
    }
}
/****************************************************************************************************
LOGIN AUTHENTICATION => STARTS
 ***************************************************************************************************/


/****************************************************************************************************
VALIDATE USERNAME => STARTS
 ***************************************************************************************************/
const validateUsername = async userName => {
    let user = await User.findOne({ userName });
    return user ? false : true;
};

/**
 * @DESC Passport middleware 
 */
const userAuth = passport.authenticate('jwt', { session: false });
/****************************************************************************************************
VALIDATE USERNAME => ENDS
 ***************************************************************************************************


/****************************************************************************************************
ROLES BASED AUTHENTICATION => STARTS
 ***************************************************************************************************/
/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => (req, res, next) =>
    !roles.includes(req.user.role)
        ? res.status(401).json("Unauthorized")
        : next();

/****************************************************************************************************
ROLES BASED AUTHENTICATION => ENDS
 ***************************************************************************************************/


/****************************************************************************************************
VALIDATE EMAIL => STARTS
 ***************************************************************************************************/
const validateEmail = async email => {
    let user = await User.findOne({ email });
    return user ? false : true;
};
/****************************************************************************************************
VALIDATE EMAIL => ENDS
****************************************************************************************************/


/****************************************************************************************************
SERIALIZE USER => STARTS
 ***************************************************************************************************/
const serializeUser = user => {
    return {
        username: user.userName,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        birthday: user.birthday,
        biography: user.biography,
        address: user.address,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        followers: user.followers,
        followings: user.followings,
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
        _id: user._id
    };
}
/****************************************************************************************************
SERIALIZE USER => ENDS
 ***************************************************************************************************/

module.exports = {
    checkRole,
    userAuth,
    userLogin,
    adminLogin,
    userRegister,
    serializeUser
};