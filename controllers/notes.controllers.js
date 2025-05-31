const notesDao = require('../Dao/notes.dao');

exports.createNote = async (req, res) => {
    try {
        const { note } = req.body;
        if (!note) {
            return res.status(400).json({ success: false, message: "Note title is required to add a note." });
        }

        const updatedUser = await notesDao.createOrUpdateNote(req.user.email, note);
        res.status(200).json({ success: true, message: "Note added successfully.", updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        if(!req.user.email) return res.status(404).json({success:false, message:"login user not found"});
            
        const updatedUser = await notesDao.deleteNote(req.user.email);
        res.status(200).json({ success: true, message: "Note deleted successfully.", updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
