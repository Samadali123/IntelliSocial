const userModel = require("../models/user.model")
const postModel = require("../models/post.model")
const storyModel = require("../models/story.model")
const utils = require("../utils/date.utils")


exports.getFeeds = async(req, res, next) => {
    try {
        // Find the logged-in user's details
        const loginuser = await userModel.findOne({ email: req.user.email });
        // Exclude posts by blocked users
        const allposts = await postModel.find({
            $and: [
                {
                    $or: [
                        { 'user': loginuser._id }, // Posts by the logged-in user
                        { 'user': { $in: loginuser.following } }, // Posts by users the login user follows
                        { 'user.privateAccount': false } // Posts by users with a public account
                    ]
                },
                {
                    'user': { $nin: loginuser.blockedUsers } // Exclude posts from blocked users
                }
            ]
        }).populate('user').populate('comments');


        const allstory = await storyModel.find({
            $and: [
                { user: { $ne: loginuser._id } },
                {
                    $or: [
                        { 'user.privateAccount': false },
                        { user: { $in: loginuser.following } }
                    ]
                },
                { user: { $nin: loginuser.blockedUsers } }
            ]
        }).populate('user');

        // Filter unique user stories
        const obj = {};
        const userStories = allstory.filter(story => {
            if (!obj[story.user._id]) {
                obj[story.user._id] = true;
                return true;
            }
            return false;
        });

        // Respond with JSON data instead of rendering a page
        res.json({  loginuser, allposts, userStories, dater: utils.formatRelativeTime });
    } catch (error) {
        res.status(500).json({success:false, message : error.message})
    }
}





exports.searchUsers = async(req, res, next) => {
    try {

        // Find the logged-in user's details
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get the input parameter and create a regex for case-insensitive search
        const input = req.params.input || req.query.input;
        const regex = new RegExp(`^${input}`, 'i');

        // Find users matching the regex and exclude those in the blockedUsers array
        const users = await userModel.find({
            username: regex,
            _id: { $nin: loginuser.blockedUsers } // Exclude users that are in the blockedUsers array
        });
        res.status(200).json({success:true, users})

    } catch (error) {
       res.status(500).json({success:false, message:error.message})
    }
}


exports.getOpenuserProfile = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "Logged-in user not found." });
        }

        const openuser = await userModel.findOne({ username: req.params.username || req.query.username }).populate(`posts`);
        if (!openuser) {
            return res.status(404).json({ success: false, message: "Open user not found." });
        }

        // Respond with JSON data instead of rendering a page
        res.status(200).json({ loginuser, openuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}