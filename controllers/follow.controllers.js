const followDao = require('../Dao/follow.dao');
const userDao = require('../Dao/user.dao');
const mongoose = require('mongoose');

exports.FollowAndUnfollow = async (req, res) => {
    try {
        const followerUserId = req.body.followeruserId;
        if (!followerUserId) {
            return res.status(400).json({ success: false, message: "Follower user ID is required." });
        }

        const followedUser = await userDao.findById(followerUserId);
        const followingUser = await userDao.findByEmail(req.user.email);

        if (!followedUser) {
            return res.status(404).json({ success: false, message: "Followed User not found" });
        }

        if (!followingUser) {
            return res.status(404).json({ success: false, message: "Following User not found" });
        }

        const isFollowing = await followDao.isFollowing(followingUser._id, followedUser._id);
        const isFollowedBy = await followDao.isFollowedBy(followedUser._id, followingUser._id);

        if (!isFollowing) {
            await followDao.addFollowing(followingUser._id, followedUser._id);
            await followDao.addFollower(followedUser._id, followingUser._id);
        } else {
            await followDao.removeFollowing(followingUser._id, followedUser._id);
            await followDao.removeFollower(followedUser._id, followingUser._id);
        }

        res.status(200).json({ success: true, followingUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }

        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "Login User not found" });
        }

        const userId = req.params.userId 
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        const openprofileuser = await followDao.getUserFollowers(userId, 'followers following');
        if (!openprofileuser) {
            return res.status(404).json({ success: false, message: "Open profile User not found" });
        }

        res.status(200).json({ openprofileuser, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFollowings = async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }

        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "Login User not found." });
        }

        const userId = req.params.userId ;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        const openprofileuser = await followDao.getUserFollowing(userId, 'followers following');
        if (!openprofileuser) {
            return res.status(404).json({ success: false, message: "Open profile User not found." });
        }

        res.status(200).json({ openprofileuser, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getLoginuserFollowers = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    const loginuser = await followDao.getUserFollowers(req.user.email);
    if (!loginuser) {
      return res.status(404).json({ success: false, message: "Login User not found." });
    }

    if (!loginuser.followers || loginuser.followers.length === 0) {
      return res.status(200).json({ success: true, message: "No followers found.", loginuser });
    }

    res.status(200).json({ success: true, loginuser, followers: loginuser.followers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoginuserFollowings = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    const loginuser = await followDao.getUserFollowing(req.user.email);
    if (!loginuser) {
      return res.status(404).json({ success: false, message: "Login User not found." });
    }

    if (!loginuser.following || loginuser.following.length === 0) {
      return res.status(200).json({ success: true, message: "No followings found.", loginuser });
    }

    res.status(200).json({ success: true, loginuser, followings: loginuser.following });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





exports.removeLoginuserFollower = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        // Check if the user is authenticated
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }

        const followerToDelete = await userDao.findById(userId);
        if (!followerToDelete) {
            return res.status(404).json({ success: false, message: "Follower not found." });
        }

        const loginUser = await userDao.findByEmail(req.user.email);
        if (!loginUser) {
            return res.status(404).json({ success: false, message: "Logged-in user not found." });
        }

        // Check if the follower is actually in the login user's followers
        if (!loginUser.followers.includes(followerToDelete._id)) {
            return res.status(400).json({ success: false, message: "Follower is not in your followers list." });
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
};


exports.searchUserFollowers = async (req, res) => {
    try {
        const openUserId =  req.query.openUserId;
        const inputQuery =  req.query.input;
       
        // Check if openUser and input are provided
        if (!openUserId || !inputQuery) {
            return res.status(400).json({ success: false, message: 'Open user and input are required.' });
        }

        // Check if openUser is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(openUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
        }

        const regex = new RegExp(inputQuery, 'i');
        const user = await userDao.findById(openUserId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the user has followers
        if (!user.followers || user.followers.length === 0) {
            return res.status(200).json({ success: true, message : 'No followers found with this input' });
        }

        const followers = user.followers.filter(follower => regex.test(follower.username));
        res.status(200).json({ success: true, followers });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchUserFollowings = async (req, res) => {
    try {
        const openUserId =  req.query.openUserId;
        const inputQuery = req.query.input;

        // Check if openUser and input are provided
        if (!openUserId || !inputQuery) {
            return res.status(400).json({ success: false, message: 'Open user and input are required.' });
        }

        // Check if openUser is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(openUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
        }

        const regex = new RegExp(inputQuery, 'i');
        const user = await userDao.findById(openUserId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the user has following
        if (!user.following || user.following.length === 0) {
            return res.status(200).json({ success: true, message : 'No following found with this input' });
        }

        const following = user.following.filter(followingUser => regex.test(followingUser.username));
        res.status(200).json({ success: true, following });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};







