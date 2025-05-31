const userModel = require('../models/user.model');
const mongoose = require('mongoose');

// Find user by email
const findByEmail = async (email) => {
    return await userModel.findOne({ email }).populate("followers").populate("following").populate("blockedUsers").populate("posts").populate("myStories")

    
};

const RegisterUser = async(username, fullname, email, password)=>{
   return  await userModel.create({
        username,
        fullname,
        email,
        password
     });
}

// Get Total Users Count
const getTotalUsersCount = async () =>{
       return await userModel.countDocuments();
}


// Get TotalUsers by usernames
const getTotalUsersByUsernames = async () =>{
     return await userModel.find({}, 'username');
}


const getTotalUsersWhoLikesPostSearch = async (regex, likedUserIds) => {
    return await userModel.find({
        _id: { $in: likedUserIds },
        username: regex
    });
};


// Find user by ID
const findById = async (userId) => {
    return await userModel.findById(userId).populate("followers").populate("following");
};

// Find user by ID with populated fields
const findByIdWithPopulate = async (userId, populateFields) => {
    return await userModel.findById(userId).populate(populateFields);
};

// Update user profile
const updateProfile = async (email, updateData) => {
    return await userModel.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
    );
};

// Update user note
const updateNote = async (email, note) => {
    return await userModel.findOneAndUpdate(
        { email },
        { $set: { note } },
        { new: true }
    );
};

// Add story to user
const addStory = async (userId, storyId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        {
            $push: {
                stories: storyId,
                myStories: storyId
            }
        },
        { new: true }
    );
};


// Add highlight to user
const addHighlight = async (userId, highlightId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $push: { highlights: highlightId } },
        { new: true }
    );
};

// Add post to user
const addPost = async (userId, postId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $push: { posts: postId } },
        { new: true }
    );
};

// Add saved post to user
const addSavedPost = async (userId, postId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $push: { savedPosts: postId } },
        { new: true }
    );
};

// Remove saved post from user
const removeSavedPost = async (userId, postId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $pull: { savedPosts: postId } },
        { new: true }
    );
};

// Add liked story to user
const addLikedStory = async (userId, storyId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $push: { likedstories: storyId } },
        { new: true }
    );
};

// Remove liked story from user
const removeLikedStory = async (userId, storyId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $pull: { likedstories: storyId } },
        { new: true }
    );
};

// Add blocked user
const addBlockedUser = async (userId, blockedUserId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $push: { blockedUsers: blockedUserId } },
        { new: true }
    );
};

// Remove blocked user
const removeBlockedUser = async (userId, blockedUserId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $pull: { blockedUsers: blockedUserId } },
        { new: true }
    );
};

// Clear user content
const clearUserContent = async (userId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        {
            $set: {
                posts: [],
                highlights: [],
                stories: []
            }
        },
        { new: true }
    );
};

module.exports = {
    findByEmail,
    getTotalUsersWhoLikesPostSearch,
    RegisterUser,
    getTotalUsersCount,
    getTotalUsersByUsernames,
    findById,
    findByIdWithPopulate,
    updateProfile,
    updateNote,
    addStory,
    addHighlight,
    addPost,
    addSavedPost,
    removeSavedPost,
    addLikedStory,
    removeLikedStory,
    addBlockedUser,
    removeBlockedUser,
    clearUserContent
};
