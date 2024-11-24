const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const userModel = require("../models/user.model");
const sendToken = require("../utils/sendtoken.utils");
const crypto = require("crypto");





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
        if (!username || !fullname || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required details" });
        }

        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(409).json({ success: false, message: "User is already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            username,
            fullname,
            email,
            password: hashedPassword
        });
        sendToken(newUser, res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}



exports.SignIn = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(403).json({ success: false, message: "Please provide fields for sign in." });
        }

        let user = await userModel.findOne({ email });
        if (!user) return res.status(403).json({ success: false, message: "User not found with this email address." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            sendToken(user, res);
            return;
            // return res.status(200).json({ success: true, message: "User signed in successfully.", user });
        } else {
            return res.status(400).json({ success: false, message: "Invalid Email or Password." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
 


exports.getLoginuser = async (req, res) => {
    try {
        const userId = req.user.userid;

        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found in request." });
        }

        const loginUser = await userModel.findById(userId);
        
        if (!loginUser) {
            return res.status(403).json({ success: false, message: "Login user not found. Please check credentials." });
        }

        return res.status(200).json({ success: true, loginUser });
        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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
        if (!email) return res.status(403).json({ success: false, message: "please provide email address for sending mail." });
        const User = await userModel.findOne({ email });

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

            // Generate a unique reset token and set its expiration time
            const resetToken = crypto.randomBytes(32).toString('hex'); // Generate a unique token using crypto
            User.resetPasswordToken = resetToken;
            User.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // Token valid for 5 minutes
            User.resetpasswordtoken = 1; // Set resetPasswordtoken value to 1
            await User.save();

            var mailOptions = {
                from: process.env.Email,
                to: email,
                subject: `Forget your IntelliSocial Password? Reset now using the link below`,
                html: `
                  <a 
                    href="${`${req.protocol}://${req.get('host')}/users/newpassword`}" 
                    style="color: royalblue; font-size: 18px; font-weight: 600; text-decoration: none;">
                    Reset Password
                  </a>
                `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return res.send(error);
                }
                res.status(200).json({ success: true, message: "Email sent successfully, check your email" });
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



exports.updatePassword = async (req, res) => {
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

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedNewPassword;
        user.resetpasswordtoken = 0;
        await user.save();

        // Send password reset confirmation email
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Email,
                pass: process.env.Password
            }
        });
       
        const resetUrl = `${req.protocol}://${req.get('host')}/users/login`;
        var mailOptions = {
            from: process.env.Email,
            to: user.email,
            subject: 'Password Reset Confirmation',
            html: `Your password has been successfully reset. You can now log in at: <a href="${resetUrl}">${resetUrl}</a>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Password reset successful. Confirmation email sent.'
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Email and new password are required to reset the password.'
        });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedNewPassword;
        await user.save();

        // Send token and success response
        sendToken(user, res); // Send token first

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};









