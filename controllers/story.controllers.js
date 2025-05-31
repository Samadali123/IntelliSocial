const storyDao = require('../Dao/story.dao');
const userDao = require('../Dao/user.dao');
const mongoose = require("mongoose")

exports.addStory = async (req, res) => {
    try {
        const loginuser = await userDao.findByEmail(req.user.email);
        if(!loginuser) return res.status(403).json({success:false, message : "login user not found!!!"});
            
        if (!req.file.path) {
            return res.status(403).json({ success: false, message: "Please upload path for uploading a Story" });
        }

        const newStory = await storyDao.createStory({
            user: loginuser._id,
            image: req.file.path
        });

        await userDao.addStory(loginuser._id, newStory._id);
        res.status(200).json({ success: true, message: "Story uploaded successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



exports.getStories = async (req, res) => {
    try {
        const loginUser = await userDao.findByEmail(req.user.email);
        if (!loginUser) {
            return res.status(404).json({ success: false, message: "Login user not found!" });
        }

        const stories = await storyDao.findByUserIdWithPopulate(loginUser._id, 'user');
        if (stories.length > 0) {
            return res.status(200).json({ success: true, stories });
        } else {
            return res.status(204).json({ success: false, message: "No stories available." });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleStory = async(req, res) => {
    try {
        const storyID =  req.params.id;
        if(!storyID) return res.status(403).json({success:false, message: "Story Id not found"});
        
        const story = await storyDao.findById(storyID);
        res.status(200).json({success:true, message:"Story fetched successfully", story});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }
};

exports.likeStory = async (req, res, next) => {
    try {
        const storyId = req.body.storyId ;
        if (!mongoose.Types.ObjectId.isValid(storyId)) {
            return res.status(400).json({ error: "Invalid StoryId" });
        }

        const likedStory = await storyDao.findById(storyId);
        if (!likedStory) {
            return res.status(404).json({ error: "Story not found" });
        }

        const loginUser = await userDao.findByEmail(req.user.email);
        if (!loginUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const userIndexInLikes = likedStory.likes.indexOf(loginUser._id);
        const storyIndexInUserLikes = loginUser.likedstories.indexOf(likedStory._id);

        if (userIndexInLikes === -1) {
            await storyDao.addLike(storyId, loginUser._id);
            await userDao.addLikedStory(loginUser._id, storyId);
        } else {
            await storyDao.removeLike(storyId, loginUser._id);
            await userDao.removeLikedStory(loginUser._id, storyId);
        }

        res.status(200).json({ success: true, message: "story liked successfully", likedStory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteStory = async (req, res, next) => {
    try {
        const storyId = req.params.storyId 
        // Validate if storyId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(storyId)) {
            return res.status(400).json({ error: "Invalid StoryId" });
        }

        const storyToDelete = await storyDao.findById(storyId);
        if (!storyToDelete) {
            return res.status(404).json({ error: "Story not found" });
        }

        const loginUser = await userDao.findByEmail(req.user.email);
        if (!loginUser) {
            return res.status(404).json({ error: "User not found" });
        }

        await storyDao.deleteStory(storyId);
        res.status(200).json({ success:true,message: "Story successfully deleted", story: storyToDelete });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}