
const express = require('express');
const router = express.Router();
const passport = require(`passport`)
const GoogleStrategy = require("passport-google-oidc")
const userModel = require("../models/user.model")
const bcrypt = require("bcrypt");
const { v4: uuidV4 } = require(`uuid`);
const { authentication } = require("../middlewares/auth.middleware")
const sendToken = require('../utils/sendtoken.utils');
const { homePage, SignUp, SignOut, SignIn, sentMail, getLoginuser, updatePassword, resetPassword } = require('../controllers/user.controllers');


router.get('/login/federated/google',  passport.authenticate('google'));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/users/oauth2/redirect/google',
    scope: ['profile', 'email'],
    passReqToCallback: true // Passes req object to the verify callback
}, async function verify(req, profile, cb) {
    try {
        console.log(profile.emails[0].value);
        let user = await userModel.findOne({ email: profile.emails[0].value });
        if (user) {
            sendToken(user, req.res); // Use req.res to access the response object
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
            sendToken(newUser, req.res); // Use req.res to access the response object
            return cb(null, newUser);
        }
    } catch (error) {
        return cb(error); // Handle errors properly
    }
}));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/profile/loginuser',
    failureRedirect: '/users/login'
}));


// /home
router.get("/home",  homePage)

// /users/register
router.post("/register",  SignUp)

// /users/login
router.post("/login", SignIn)

// /users/loginuser
router.get("/loginuser", authentication, getLoginuser)

// /users/logout
router.get("/logout", authentication, SignOut);


// /users/forgotPassword
router.post("/forgotpassword", sentMail)


// /users/newpassword
router.post("/newpassword", updatePassword)


// /users/resetpassword
router.post("/resetpassword", authentication,  resetPassword)





module.exports = router;


