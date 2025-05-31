const storyModel = require('../models/story.model');

// Create new story
const createStory = async (storyData) => {
    return await storyModel.create(storyData);
};

// Find story by ID
const findById = async (storyId) => {
    return await storyModel.findById(storyId);
};

// Find story by ID with populated fields
const findByIdWithPopulate = async (storyId, populateFields) => {
    return await storyModel.findById(storyId).populate(populateFields);
};

// Find stories by user ID
const findByUserId = async (userId) => {
    return await storyModel.find({ user: userId });
};

// Find stories by user ID with populated fields
const findByUserIdWithPopulate = async (userId, populateFields) => {
    return await storyModel.find({ user: userId }).populate(populateFields);
};

// Add like to story
const addLike = async (storyId, userId) => {
    return await storyModel.findByIdAndUpdate(
        storyId,
        { $push: { likes: userId } },
        { new: true }
    );
};

// Remove like from story
const removeLike = async (storyId, userId) => {
    return await storyModel.findByIdAndUpdate(
        storyId,
        { $pull: { likes: userId } },
        { new: true }
    );
};

// Delete story
const deleteStory = async (storyId) => {
    return await storyModel.findByIdAndDelete(storyId);
};

// Delete multiple stories
const deleteManyStories = async (storyIds) => {
    return await storyModel.deleteMany({ _id: { $in: storyIds } });
};

// Find stories for highlights
const findStoriesForHighlights = async (storyIds) => {
    return await storyModel.find({ _id: { $in: storyIds } });
};

module.exports = {
    createStory,
    findById,
    findByIdWithPopulate,
    findByUserId,
    findByUserIdWithPopulate,
    addLike,
    removeLike,
    deleteStory,
    deleteManyStories,
    findStoriesForHighlights
};
