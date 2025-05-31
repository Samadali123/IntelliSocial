
const jwt  = require("jsonwebtoken")
const secretKey = process.env.JWT_SECRET_KEY;

module.exports   =  sendToken = (user, res) => {
    const token = jwt.sign({ email: user.email, userid: user._id }, secretKey, { expiresIn: '1h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });

    return res.status(200).json({ success: true, user, token });
};


