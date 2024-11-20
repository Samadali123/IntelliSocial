const userModel = require("../models/user.model")



exports.createNote = async (req, res) => {
    try {
        const { note } = req.body;
        if (!note) {
            return res.status(400).json({ success: false, message: "Note title is required to add a note." });
        }

        const updatedUser = await userModel.findOneAndUpdate(
            { email: req.user.email },
            { $set: { note: note } },
            { new: true }
        );
       
        res.status(200).json({ success: true, message: "Note added successfully.", updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.deleteNote = async (req, res) => {
    try {
        const updatedUser = await userModel.findOneAndUpdate(
            { email: req.user.email },
            { $set: { note: "" } },
            { new: true }
        );
        res.status(200).json({ success: true, message: "Note deleted successfully.", updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}