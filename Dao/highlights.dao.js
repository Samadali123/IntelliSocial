const HighlightModel = require('../models/highlights.model');

// Create new highlight
const createHighlight = async ({ stories, coverphoto, title, user }) => {
    return await HighlightModel.create({
        stories,
        coverphoto,
        title,
        user,
    });
};


// Find highlight by ID
const findById = async (highlightId) => {
    return await HighlightModel.findById(highlightId);
};

// Find highlight by ID with populated fields
const findByIdWithPopulate = async (highlightId, populateFields) => {
    return await HighlightModel.findById(highlightId).populate(populateFields);
};

// Find highlights by user ID
const findByUserId = async (userId) => {
    return await HighlightModel.find({ user: userId });
};

// Find highlights by user ID with populated fields
const findByUserIdWithPopulate = async (userId, populateFields) => {
    return await HighlightModel.find({ user: userId }).populate(populateFields);
};

// Update highlight
const updateHighlight = async (highlightId, updateData) => {
    return await HighlightModel.findByIdAndUpdate(
        highlightId,
        { $set: updateData },
        { new: true }
    );
};

// Delete highlight
const deleteHighlight = async (highlightId) => {
    return await HighlightModel.findByIdAndDelete(highlightId);
};


const removeHighlight = async (userId, highlightId) => {
    // Step 1: Find the user
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Step 2: Check if highlightId exists in user's highlights
    const exists = user.highlights.includes(highlightId);
    if (!exists) {
        throw new Error("Highlight not found in user's highlights");
    }

    // Step 3: Remove highlight from user's highlights array
    return await userModel.findByIdAndUpdate(
        userId,
        { $pull: { highlights: highlightId } },
        { new: true }
    );
};


// Delete multiple highlights
const deleteManyHighlights = async (highlightIds) => {
    return await HighlightModel.deleteMany({ _id: { $in: highlightIds } });
};

module.exports = {
    createHighlight,
    findById,
    findByIdWithPopulate,
    findByUserId,
    findByUserIdWithPopulate,
    updateHighlight,
    deleteHighlight,
    deleteManyHighlights
};
