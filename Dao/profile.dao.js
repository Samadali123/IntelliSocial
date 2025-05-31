const userModel = require('../models/user.model');

// Get user profile with posts and highlights
const getProfileWithPostsAndHighlights = async (email) => {
    return await userModel.findOne({ email })
        .populate('posts')
        .populate('highlights');
};

// Update user profile
const updateProfile = async (email, updateData) => {
    return await userModel.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
    );
};

// Update profile picture
const updateProfilePicture = async (email, profilePath) => {
    return await userModel.findOneAndUpdate(
        { email },
        { $set: { profile: profilePath } },
        { new: true }
    );
};

// Get user profile with followers and following
const getProfileWithFollows = async (email) => {
    return await userModel.findOne({ email })
        .populate('followers')
        .populate('following');
};

// Get user profile with all populated fields
const getFullProfile = async (email) => {
    return await userModel.findOne({ email })
        .populate('posts')
        .populate('highlights')
        .populate('followers')
        .populate('following')
        .populate('savedPosts')
        .populate('stories');
};

// Get open user profile
const getOpenUserProfile = async (userId) => {
    return await userModel.findById(userId)
        .populate('posts')
        .populate('followers')
        .populate('following');
};

module.exports = {
    getProfileWithPostsAndHighlights,
    updateProfile,
    updateProfilePicture,
    getProfileWithFollows,
    getFullProfile,
    getOpenUserProfile
};
