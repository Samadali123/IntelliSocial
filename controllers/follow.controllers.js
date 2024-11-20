const userModel = require("../models/user.model")

exports.followAndUnfollow = async (req, res) => {
    try {
        const followedUser = await userModel.findOne({ username: req.params.followeruser || req.query.followeruser });
        const followingUser = await userModel.findOne({ email: req.user.email });

        if (!followedUser) {
            return res.status(404).json({ success: false, message: "Followed User not found" });
        }

        if (!followingUser) {
            return res.status(404).json({ success: false, message: "Following User not found" });
        }

        const isFollowing = followedUser.followers.includes(followingUser._id);
        const isFollowedBy = followingUser.following.includes(followedUser._id);

        if (!isFollowing) {
            followedUser.followers.push(followingUser._id);
        } else {
            followedUser.followers = followedUser.followers.filter(id => !id.equals(followingUser._id));
        }

        if (!isFollowedBy) {
            followingUser.following.push(followedUser._id);
        } else {
            followingUser.following = followingUser.following.filter(id => !id.equals(followedUser._id));
        }

        await followedUser.save();
        await followingUser.save();

        res.status(200).json({ success: true, followingUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.getFollowers = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email })
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "login User not found" });
        }
        const openprofileuser = await userModel.findOne({ _id: req.params.userId || req.query.userId }).populate(`followers`).populate(`following`)
        if (!openprofileuser) {
            return res.status(404).json({ success: false, message: "openprofile User not found" });
        }
        res.status(200).json({ openprofileuser, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


exports.getFollowings = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email })
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "login User not found" });
        }
        const openprofileuser = await userModel.findOne({ _id: req.params.userId }).populate(`followers`).populate(`following`)
        if (!openprofileuser) {
            return res.status(404).json({ success: false, message: "openprofile User not found" });
        }
        res.status(200).json({ openprofileuser, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


exports.getLoginuserFollowers = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("followers").populate("following")
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "login User not found" });
        }

        res.status(200).json({loginuser, followers:loginuser.followers });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

exports.getLoginuserFollowings = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("followers").populate("following");
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "login User not found" });
        }
        res.status(200).json({loginuser, followings:loginuser.followings});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}



exports.removeLoginuserFollower = async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        const followerToDelete = await userModel.findById(userId).populate("following");
        if (!followerToDelete) {
            return res.status(404).json({ success: false, message: "Follower not found." });
        }

        const loginUser = await userModel.findOne({ email: req.user.email }).populate("followers");
        if (!loginUser) {
            return res.status(404).json({ success: false, message: "Logged-in user not found." });
        }

        // Remove follower from login user's followers
        const followerIndex = loginUser.followers.indexOf(followerToDelete._id);
        if (followerIndex > -1) {
            loginUser.followers.splice(followerIndex, 1);
        }

        // Remove login user from follower's following
        const followingIndex = followerToDelete.following.indexOf(loginUser._id);
        if (followingIndex > -1) {
            followerToDelete.following.splice(followingIndex, 1);
        }

        await loginUser.save();
        await followerToDelete.save();

        res.json({ success: true, followers: loginUser.followers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



exports.searchUserFollowers = async (req, res) => {
    try {
        const openUser = req.params.openuser || req.query.openuser;
        const input = req.params.input || req.query.input;

        // Check if openUser and input are provided
        if (!openUser || !input) {
            return res.status(400).json({ success: false, message: 'Open user and input are required.' });
        }

        const regex = new RegExp(`^${input}`, 'i');
        const user = await userModel.findOne({ username: openUser }).populate('followers');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const followers = user.followers.filter(follower => regex.test(follower.username));
        res.status(200).json({ success: true, followers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }
}


exports.searchUserFollowings = async (req, res) => {
    try {
        const openUser = req.params.openuser || req.query.openuser;
        const input = req.params.input || req.query.input;

        // Check if openUser and input are provided
        if (!openUser || !input) {
            return res.status(400).json({ success: false, message: 'Open user and input are required.' });
        }

        const regex = new RegExp(`^${input}`, 'i');
        const user = await userModel.findOne({ username: openUser }).populate('following');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const following = user.following.filter(followingUser => regex.test(followingUser.username));
        res.status(200).json({ success: true, following });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}






