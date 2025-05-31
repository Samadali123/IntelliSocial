const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const HighlightModel = require('../models/highlights.model');
const storyModel = require('../models/story.model');

// Get user saved posts
const getSavedPosts = async (email) => {
    return await userModel.findOne({ email }).populate('savedPosts');
};

// Get user liked posts
const getLikedPosts = async (userId) => {
    return await postModel.find({ likes: userId }).populate('user');
};

// Get user posts
const getUserPosts = async (email) => {
    return await userModel.findOne({ email }).populate('posts');
};

// Get user highlights
const getUserHighlights = async (email) => {
    return await userModel.findOne({ email }).populate('highlights');
};

// Get single highlight
const getSingleHighlight = async (highlightId) => {
    return await HighlightModel.findById(highlightId).populate('user');
};

// Get archive story
const getArchiveStory = async (storyId) => {
    return await storyModel.findById(storyId).populate('user');
};

// Get single post
const getSinglePost = async (postId) => {
    return await postModel.findById(postId).populate('user');
};

// Get open user posts
const getOpenUserPosts = async (userId) => {
    return await userModel.findById(userId).populate('posts');
        // .populate('followers')
        // .populate('following');
};

// Get open user liked posts
const getOpenUserLikedPosts = async (userId, postId) => {
    const openPost = await postModel.findById(postId).populate('user');
    const count = await postModel.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const randomPosts = await postModel.find()
        .skip(randomIndex)
        .limit(19)
        .populate('user');
    return { openPost, randomPosts };
};

// Remove user content
const removeUserContent = async (userId) => {
    const user = await userModel.findById(userId).populate('posts highlights stories');
    if (!user) return null;

    await postModel.deleteMany({ _id: { $in: user.posts } });
    await HighlightModel.deleteMany({ _id: { $in: user.highlights } });
    await storyModel.deleteMany({ _id: { $in: user.stories } });

    user.posts = [];
    user.highlights = [];
    user.stories = [];
    await user.save();

    return user;
};

module.exports = {
    getSavedPosts,
    getLikedPosts,
    getUserPosts,
    getUserHighlights,
    getSingleHighlight,
    getArchiveStory,
    getSinglePost,
    getOpenUserPosts,
    getOpenUserLikedPosts,
    removeUserContent
};
