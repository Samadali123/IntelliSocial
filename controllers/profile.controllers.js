const profileDao = require('../Dao/profile.dao');
const userDao = require("../Dao/user.dao")

exports.getLoginuserProfile = async(req, res, next) => {
    try {
        const loginuser = await profileDao.getProfileWithPostsAndHighlights(req.user.email);
        if(!loginuser) return res.status(403).json({success:false, message : "login user is not found"});
        res.status(200).json({ loginuser });
    } catch (error) {
        res.status(500).json({ success:false, message: error.message});
    }
}

exports.uploadProfile = async(req, res, next) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a profile image to upload.',
            });
        }

        const loginuser = await profileDao.updateProfilePicture(req.user.email, req.file.path);
        if(!loginuser) return res.status(403).json({success:false, message : "login user is not found"});

        res.status(200).json({success:true, loginuser, message : "profile uploaded successfully."});
    } catch (error) {
        res.status(500).json({success:false, message : error.message});
    }
}

exports.editProfile = async(req, res, next) => {
    try {
        const { username, fullname, bio } = req.body;
        if(!username || !fullname || !bio) return res.status(403).json({success:false, message : "please provide fields for edit profile."});
        
    const User = await  userDao.findByEmail(req.user.email);
        if(!User) return res.status(403).json({success:false, message : "login user is not found"});
        
        User.username = username;
        User.fullname = fullname;
       User.bio = bio;
        await User.save();
        res.status(200).json({success:true, message : "edit profile successfully.", loginuser: User});
    } catch (error) {
        res.status(500).json({success:false, message : error.message});
    }
}


