
const express = require('express');
const router = express.Router();
const passport = require(`passport`)
const GoogleStrategy = require("passport-google-oidc")
const userModel = require("../models/user.model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const secretKey = process.env.JWT_SECRET_KEY;
const { v4: uuidV4 } = require(`uuid`);
const { authentication } = require("../middlewares/auth.middleware")
const sendToken = require('../utils/sendtoken.utils');
const { homePage, SignUp, SignOut, SignIn, sentMail, resetPassword } = require('../controllers/user.controllers');


router.get('/login/federated/google', passport.authenticate('google'));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile', 'email'],
    passReqToCallback: true // Passes req object to the verify callback
}, async function verify(req, profile, cb) {
    console.log(profile.emails[0].value)
    let user = await userModel.findOne({ email: profile.emails[0].value });
    if (user) {
        const token = jwt.sign({ email: profile.emails[0].value, userid: user._id },
            secretKey, { algorithm: 'HS256', expiresIn: '1h' }
        );
        // Set token as a cookie using res object from request
        req.res.cookie('token', token, { maxAge: 3600000, httpOnly: true }); // Expires in 1 hour
        return cb(null, user);
    } else {

        const salt = await bcrypt.genSalt(10);
        const password = uuidV4();
        const hashedPassword = await bcrypt.hash(password, salt);
        let newUser = await userModel.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: hashedPassword,
        });

        // const token = jwt.sign({ email: profile.emails[0].value, userid: newUser._id },
        //     secretKey, { algorithm: 'HS256', expiresIn: '1h' }
        // );

        // // Set token as a cookie using res object from request
        // req.res.cookie('token', token, { maxAge: 3600000, httpOnly: true }); // Expires in 1 hour
        sendToken(newUser,res);
        await newUser.save();
        return cb(null, newUser)
    }
}));


router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));



// /home
router.get("/home",  homePage)

// /users/register
router.post("/register",  SignUp)

// /users/logout
router.get("/logout", authentication, SignOut);


// /users/login
router.post("/login", SignIn)



// /users/forgotPassword
router.post("/forgotpassword", sentMail)



// /users/resetpassword
router.post("/resetpassword", authentication, resetPassword)



module.exports = router;


