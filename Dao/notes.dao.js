const userModel = require('../models/user.model');

// Create or update note
const createOrUpdateNote = async (email, note) => {
    return await userModel.findOneAndUpdate(
        { email },
        { $set: { note } },
        { new: true }
    );
};

// Delete note
const deleteNote = async (email) => {
    return await userModel.findOneAndUpdate(
        { email },
        { $set: { note: "" } },
        { new: true }
    );
};

// Get user note
const getUserNote = async (email) => {
    const user = await userModel.findOne({ email });
    return user ? user.note : null;
};

module.exports = {
    createOrUpdateNote,
    deleteNote,
    getUserNote
};
