const userModel = require("../models/user.model")

exports.getLoginuserProfile = async(req,res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate(`posts`).populate("highlights")
        if(! loginuser) return res.status(403).json({success:false, message : "login user is not found"})
        res.status(200).json({ loginuser });
    } catch (error) {
        res.status(500).json({ success:false, message: error.message})
    }
}

exports.uploadProfile = async(req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if(! loginuser) return res.status(403).json({success:false, message : "login user is not found"})

        if (!req.file || !req.file.path) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a profile image to upload.',
            });
        }

        // Store the file path from Cloudinary
        loginuser.profile = req.file.path;

        await loginuser.save();
        res.status(200).json({success:false, loginuser, message : "profile uploaded successfully."})
    } catch (error) {
        res.status(500).json({success:false, message : error.message})
    }
}




exports.editProfile = async(req, res, next) => {
    try {
        const { username, fullname, bio } = req.body;
        if(! username || fullname || bio) return res.status(403).json({success:false, message : "plsease provide fields for edit profile."})
        const User = await userModel.findOne({ email: req.user.email })
       if(! user) return res.status(403).json({success:false, message : "login user is not found"})
        User.username = username;
        User.fullname = fullname;
        User.bio = bio;
        await User.save();
        res.status(200).json({success:false, message : "edit profile successfully.", loginuser})
    } catch (error) {
        res.status(500).json({success:false,message : error.message})
    }
}


