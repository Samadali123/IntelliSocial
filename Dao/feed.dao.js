
const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const storyModel = require('../models/story.model');

// Get user feed posts
const getFeedPosts = async (userId, following, blockedUsers) => {
    return await postModel.find({
        $and: [
            {
                $or: [
                    { user: userId },
                    { user: { $in: following } }
                ]
            },
            {
                user: { $nin: blockedUsers }
            }
        ]
    }).populate('user').populate('comments');
};

// Get user feed stories
const getFeedStories = async (userId, following, blockedUsers) => {
    return await storyModel.find({
        $and: [
            { user: { $ne: userId } },
            {
                $or: [
                    { user: { $in: following } },
                    { 'user.privateAccount': false }
                ]
            },
            { user: { $nin: blockedUsers } }
        ]
    }).populate('user');
};

// Combines posts and stories
const getFeeds = async (userId, following, blockedUsers) => {
    const allposts = await getFeedPosts(userId, following, blockedUsers);
    const allstory = await getFeedStories(userId, following, blockedUsers);
    return { allposts, allstory };
};

// Search users by input regex, excluding blocked users
const searchUsers = async (regex, blockedUsers) => {
    return await userModel.find({
        $and: [
            {
                username: { $regex: regex }
            },
            {
                _id: { $nin: blockedUsers }
            }
        ]
    }).select('-password'); // Optional: exclude password
};

// Get another user's profile and populate posts
const getOpenUserProfile = async (userId) => {
    return await userModel.findById(userId).populate('posts');
};

module.exports = {
    getFeeds,
    getFeedPosts,
    getFeedStories,
    searchUsers,
    getOpenUserProfile
};



