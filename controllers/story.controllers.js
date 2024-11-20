const userModel = require("../models/user.model")
const storyModel = require("../models/story.model")


exports.addStory = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("myStories")
        if(! loginuser) return res.status(403).json({success:false, message : "login user not found!!!"})
            
        if (!req.file.path) {
            return res.status(403).json({ success: false, message: "Please upload path for uploading a Story" })
        }

        const newStory = await storyModel.create({
            user: loginuser._id,
            image: req.file.path
        })
        loginuser.stories.push(newStory._id);
        loginuser.myStories.push(newStory);
        await loginuser.save();
        res.status(200).json({ success: true, message: "Story uploaded successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


exports.getStories = async (req, res) => {
    try {
        const storyuser = await userModel.findOne({ email: req.user.email }).populate(`stories`)
        const loginuserId = req.params.userID || req.query.userID;
        if(loginuserId) return res.status(403).json({success: false, message: "please provide user id"})
        const loginuser = await userModel.findById(loginuserId).exec();    
        if (logiuser.stories.length > 0) {
            res.status(200).json({ success: true, stories: loginuser.stories,storyuser})
        } else {
            res.status(403).json({ success: false, message: "Do not have any stories" });
        }
       
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}


exports.getSingleStory = async(req, res)=>{
    try {
         const storyID = req.params.storyId || req.query.storyId;
         if(storyID) return res.status(403).json({success:false, message: "Story Id not found"})
         const story = await storyModel.findById(storyID).exec();
        res.status(200).json({success:true, message:"Story fetched successfully", story})
    } catch (error) {
         res.status(500).json({ success: false, message: error.message});
    }
}


exports.likeStory = async (req, res, next) => {
    try {
        const storyId = req.params.StoryId || req.query.StoryId;
        // Validate if storyId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(storyId)) {
            return res.status(400).json({ error: "Invalid StoryId" });
        }

        const likedStory = await storyModel.findById(storyId);
        if (!likedStory) {
            return res.status(404).json({ error: "Story not found" });
        }

        const loginUser = await userModel.findOne({ email: req.user.email });
        if (!loginUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const userIndexInLikes = likedStory.likes.indexOf(loginUser._id);
        const storyIndexInUserLikes = loginUser.likedstories.indexOf(likedStory._id);

        if (userIndexInLikes === -1) {
            // User hasn't liked the story yet
            likedStory.likes.push(loginUser._id);
            loginUser.likedstories.push(likedStory._id);
        } else {
            // User already liked the story, so unlike it
            likedStory.likes.splice(userIndexInLikes, 1);
            loginUser.likedstories.splice(storyIndexInUserLikes, 1);
        }

        await likedStory.save();
        await loginUser.save();
        res.status(200).json({ success: true, message: "story liked successfully", likedStory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.deleteStory = async (req, res, next) => {
    try {
        const storyId = req.params.StoryId || req.query.StoryId;
        // Validate if storyId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(storyId)) {
            return res.status(400).json({ error: "Invalid StoryId" });
        }

        const storyToDelete = await storyModel.findById(storyId);
        if (!storyToDelete) {
            return res.status(404).json({ error: "Story not found" });
        }

        const loginUser = await userModel.findOne({ email: req.user.email });
        if (!loginUser) {
            return res.status(404).json({ error: "User not found" });
        }

        await storyModel.findByIdAndDelete(storyId);
        res.json({ message: "Story successfully deleted", story: storyToDelete });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}