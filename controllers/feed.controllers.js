
// controllers/feed.controllers.js
const feedDao = require('../dao/feed.dao');
const userDao = require('../dao/user.dao');
const utils = require("../utils/date.utils");

exports.getFeeds = async (req, res) => {
    try {
        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) return res.status(404).json({ success: false, message: "User not found" });

        const { allposts, allstory } = await feedDao.getFeeds(loginuser._id, loginuser.following, loginuser.blockedUsers);

        // Filter unique user stories
        const uniqueStories = [];
        const seenUsers = new Set();
        for (const story of allstory) {
            if (!seenUsers.has(story.user._id.toString())) {
                uniqueStories.push(story);
                seenUsers.add(story.user._id.toString());
            }
        }

        res.status(200).json({
            success: true,
            loginuser,
            allposts,
            userStories: uniqueStories,
            dater: utils.formatRelativeTime
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) return res.status(404).json({ error: 'User not found' });

        const input = req.params.input || req.query.input;
        if (!input) return res.status(403).json({ success: false, message: "Please provide input to search users" });

        const regex = new RegExp(`^${input}`, 'i');
        const users = await feedDao.searchUsers(regex, loginuser.blockedUsers);

        if (users.length === 0) return res.status(404).json({ success: false, message: "No users found" });

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOpenuserProfile = async (req, res) => {
    try {
        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) return res.status(404).json({ success: false, message: "Logged-in user not found." });

        const userId = req.params.userId ;
        if (!userId) return res.status(403).json({ success: false, message: "Please provide userId for open profile" });

        const openuser = await feedDao.getOpenUserProfile(userId);
        if (!openuser) return res.status(404).json({ success: false, message: "Open user not found." });

        res.status(200).json({ success: true, loginuser, openuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




