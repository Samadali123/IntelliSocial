const postModel = require('../models/post.model');
const mongoose = require('mongoose');

// Create new post
const createPost = async (postData) => {
    return await postModel.create(postData);
};

// Find post by ID
const findById = async (postId) => {
    return await postModel.findById(postId);
};


const findByIdWithPopulate = async (id, field) => {
    return await postModel.findById(id).populate(field);
};

// Find posts by user ID
const findByUserId = async (userId) => {
    return await postModel.find({ user: userId });
};

// Find posts by user ID with populated fields
const findByUserIdWithPopulate = async (userId, populateFields) => {
    return await postModel.find({ user: userId }).populate(populateFields);
};

// Find posts by multiple user IDs
const findByUserIds = async (userIds) => {
    return await postModel.find({ user: { $in: userIds } });
};


const findByIdWithComments = async (postId) => {
    return await postModel.findById(postId)
        .populate({
            path: 'comments',
            select: '_id text',
            populate: {
                path: 'user',
                select: 'username'
            }
        });
};

const findUserPostsExcludingPost = async (userId, excludePostId) => {
    return await postModel.find({
        user: userId,
        _id: { $ne: excludePostId }
    })
        .sort({ createdAt: -1 })
        .populate("user")
        .populate({
            path: 'comments',
            select: '_id text',
            populate: {
                path: 'user',
                select: 'username'
            }
        });
};


// Add like to post
const addLike = async (postId, userId) => {
    return await postModel.findByIdAndUpdate(
        postId,
        { $push: { likes: userId } },
        { new: true }
    );
};

// Remove like from post
const removeLike = async (postId, userId) => {
    return await postModel.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
    );
};

// Add comment to post
const addComment = async (postId, commentId) => {
    return await postModel.findByIdAndUpdate(
        postId,
        { $push: { comments: commentId } },
        { new: true }
    );
};

// Remove comment from post
const removeComment = async (postId, commentId) => {
    return await postModel.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { new: true }
    );
};

// Update post
const updatePost = async (postId, updateData) => {
    return await postModel.findByIdAndUpdate(
        postId,
        { $set: updateData },
        { new: true }
    );
};

// Delete post
const deletePost = async (postId) => {
    return await postModel.findByIdAndDelete(postId);
};

// Delete multiple posts
const deleteManyPosts = async (postIds) => {
    return await postModel.deleteMany({ _id: { $in: postIds } });
};

// Get random posts
const getRandomPosts = async (limit, excludeUserIds = []) => {
    const count = await postModel.countDocuments({
        user: { $nin: excludeUserIds }
    });
    const randomIndex = Math.floor(Math.random() * count);
    return await postModel.find({
        user: { $nin: excludeUserIds }
    })
        .skip(randomIndex)
        .limit(limit)
        .populate('user');
};



module.exports = {
    createPost,
    findById,
    findByIdWithPopulate,
    findByUserId,
    findByUserIdWithPopulate,
    findByUserIds,
    findByIdWithComments,
    findUserPostsExcludingPost,
    addLike,
    removeLike,
    addComment,
    removeComment,
    updatePost,
    deletePost,
    deleteManyPosts,
    getRandomPosts
};
