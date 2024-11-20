const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer");
const userModel = require("../models/user.model");
const sendToken = require("../utils/sendtoken.utils");
const secretKey = process.env.JWT_SECRET_KEY


exports.homePage = async (req, res) => {
    try {
        res.json({ success: true, message: "Home page successfully loaded.." })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}




exports.SignUp = async (req, res, next) => {
    try {
        const { username, fullname, email, password } = req.body;
        if (!username) return res.status(403).json({ success: false, message: "Please provide username" })
        if (!fullname) return res.status(403).json({ success: false, message: "Please provide fullname" })
        if (!email) return res.status(403).json({ success: false, message: "Please provide email" })
        if (!password) return res.status(403).json({ success: false, message: "Please provide password" })
        const user = await userModel.findOne({ email });

        if (user) {
            return res.status(409).json({ success: false, message: "User is already registered.." })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        var newUser = await userModel.create({
            username,
            fullname,
            email,
            password: hashedPassword
        })

        // const token = jwt.sign({ email: newUser.email, userid: newUser._id },
        //     secretKey, { algorithm: 'HS256', expiresIn: '1h' }
        // );

        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'strict'
        // });
        sendToken(newUser, res);
        res.status(200).json({ success: true, newUser });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}



exports.SignIn = async (req, res) => {
    try {
        let { email, password } = req.body
        if (!email || password) {
            return res.status(403).json({ success: false, message: "please provide fields for sign in.." })
        }

        let user = await userModel.findOne({ email })
        if (!user) return res.status(403).json({ success: false, message: "User not found with this email address.." })


        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                res.status(err.status || 500).json({ success: false, message: err.message })
            } else {
                if (result) {
                    // let token = jwt.sign({ email: user.email, userid: user._id }, secretKey);
                    // res.cookie("token", token)
                    sendToken(user, res);
                    res.status(200).json({ success: true, message: "user sign in successfully.", user })
                } else res.status(400).json({ success: false, message: "Invalid Emaill or Password" })
            }

        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


exports.SignOut = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ success: true, message: "user sign out successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}



exports.sentMail = async (req, res) => {
    try {

        const { email } = req.body;
        if (!email) return res.status(403).json({ success: false, message: "please provide email address for sending mail." })
        const User = await userModel.findOne({ email })

        if (!User) {
            return res.status(403).json({ success: false, message: "User Not Found" });
        } else {

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.Email,
                    pass: process.env.Password
                }
            });

            var mailOptions = {
                from: process.env.Email, // Use the email you want to send from
                to: email, // Make sure this field matches the recipient's email
                subject: `Forget your Instagram Password? Reset now using the link below`,
                html: `
                  <a 
                    href="${`${req.protocol}://${req.get('host')}/users/reset-password`}" 
                    style="color: royalblue; font-size: 18px; font-weight: 600; text-decoration: none;">
                    Reset Password
                  </a>
                `
            };


            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return res.send(error)
                }
                res.status(200).json({ success: true, message: "Email sent successfully check your email" })
            })

            User.resetpasswordtoken = "1";
            await User.save();
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}




exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required.'
            });
        }

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Check if reset token is valid
        if (user.resetPasswordToken !== '1') {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset password link. Please try again.'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password and reset token
        user.password = hashedNewPassword;
        user.resetPasswordToken = '0';
        await user.save();
        sendToken(user, res);
        // Send password reset confirmation email
        const resetUrl = `${req.protocol}://${req.get('host')}/users/profile`;
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Confirmation',
            message: `Your password has been successfully reset. You can now log in at: ${resetUrl}`
        });

        return res.status(200).json({
            success: true,
            message: 'Password reset successful.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

