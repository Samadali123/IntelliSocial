const highlightsDao = require('../Dao/highlights.dao');
const userDao = require('../Dao/user.dao');
const storyModel = require('../models/story.model');

exports.getStoriesForHighlights = async (req, res) => {
    try {
        const loginuser = await userDao.findByEmail(req.user.email);
        if(loginuser.myStories.length == 0) return res.status(404).json({success:false, message: "No Stroies Available"})
        if(! loginuser) return res.status(403).json({success:false, message : "user not found"})
        res.status(200).json({ loginuser , stories: loginuser.myStories});
    } catch (error) {
        res.status(500).json({ success:false, message : error.message});
    }
}

exports.addHighlightsCover = async (req, res, next) => {
    try {
        // Fetch the logged-in user based on the request's user email
        const loginuser = await userDao.findByEmail(req.user.email);

        if (!loginuser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Extract IDs from req.body
        const idsArray = req.body.Ids;
        if (!idsArray || !Array.isArray(idsArray) || idsArray.length === 0) {
            return res.status(400).json({ error: "No valid IDs provided in the request" });
        }

        // Fetch stories based on the provided IDs
        const stories = await storyModel.find({ _id: { $in: idsArray } });

        if (stories.length === 0) {
            return res.status(404).json({ error: "No stories found for the provided IDs" });
        }

        // Prepare the response data
        const cover = stories[0].image; // Assuming each story has an 'image' field
        const responseData = {
            loginUser: {
                id: loginuser._id,
                email: loginuser.email,
                name: loginuser.name, // Add other relevant fields
            },
            cover,
            storyIds: idsArray,
            stories: stories.map((story) => ({
                id: story._id,
                image: story.image, // Assuming each story has an 'image' field
            })),
        };

        // Respond with the prepared data in JSON format
        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Error in addHighlightsCover:", error.message);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};


exports.createHighlight = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ success: false, message: "Please provide an image to upload" });
        }

        const { title, ids } = req.body;
        const image = req.file.path;

        if (!title || !ids) {
            return res.status(400).json({ success: false, message: "Please provide all the required fields" });
        }

        let storyIds = ids;

        // Handle case when `ids` is a stringified array (from form-data or frontend)
        if (typeof ids === 'string') {
            try {
                storyIds = JSON.parse(ids);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid JSON in ids" });
            }
        }

        if (!Array.isArray(storyIds)) {
            return res.status(400).json({ success: false, message: "Please provide a valid array of story IDs" });
        }

        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newHighlight = await highlightsDao.createHighlight({
            stories: storyIds,
            coverphoto: image,
            title,
            user: user._id
        });

        await userDao.addHighlight(user._id, newHighlight._id);

        res.status(201).json({ success: true, message: "Highlight created successfully", highlight: newHighlight });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



exports.getHighlights = async (req, res) => {
    try {
        const userId = req.query.userId;
        if(! userId) return res.status(400).json({success:false, message : "Please provide User Id"});

        const user = await userDao.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const highlights = await highlightsDao.findByUserIdWithPopulate(user._id, 'user');
        if(highlights.length == 0) return res.status(403).json({success:false, message : "No Highlights Found"})

        res.status(200).json({ success: true, highlights });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getHighlightsOfLoginuser = async (req, res) => {
    try {
        const userId = req.user.userid;
        if(! userId) return res.status(400).json({success:false, message : "User is not Authenticated ,Please login to continue"});

        const user = await userDao.findById(userId);
        if (! user) return res.status(403).json({ success: false, message: "User not found" });

        // Fetch all highlights for the logged-in user
        const highlights = await highlightsDao.findByUserIdWithPopulate(user._id, 'user');

        if(highlights.length == 0) return res.status(403).json({success:false, message : "you Dont have any highligjts"})

        // Return all highlights in JSON format
        res.status(200).json({ success: true, highlights });
    } catch (error) {
        // Handle errors by returning a 500 status code and the error message
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.getSingleHighlight = async (req, res) => {
    try {
        const highlightId = req.params.id
        if (!highlightId) {
            return res.status(400).json({ success: false, message: "Highlight ID is required" });
        }

        const highlight = await highlightsDao.findByIdWithPopulate(highlightId, 'user');
        if (!highlight) {
            return res.status(404).json({ success: false, message: "Highlight not found" });
        }

        res.status(200).json({ success: true, highlight });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.deleteHighlight = async (req, res) => {
    try {
        const highlightId = req.params.id;
        if (!highlightId) {
            return res.status(400).json({ success: false, message: "Highlight ID is required" });
        }

        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found or not Authenticated" });
        }

        const highlight = await highlightsDao.findById(highlightId);
        if (!highlight) {
            return res.status(404).json({ success: false, message: "Highlight not found" });
        }

        if (!highlight.user.equals(user._id)) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this highlight" });
        }

        await highlightsDao.deleteHighlight(highlightId);
        await userDao.removeHighlight(user._id, highlightId);
        res.status(200).json({ success: true, message: "Highlight deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};