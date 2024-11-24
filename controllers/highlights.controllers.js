const userModel = require("../models/user.model")
const HighlightModel = require("../models/highlights.model")



exports.getStoriesForHighlights = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("myStories");
        if(! loginuser) return res.status(403).json({success:false, message : "user not found"})
        res.status(200).json({ loginuser , stories: loginuser.stories});
    } catch (error) {
        res.status(500).json({ success:false, message : error.message});
    }
}

exports.getStoriesIdsForHighlights = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if(! loginuser) return res.status(403).json({success:false, message : "user not found"})

        const idsArray = req.params.Ids.split(",");
        if (idsArray.length > 0) {
            // Assuming you have a Story model to find the stories by their IDs
            const stories = await storyModel.find({ _id: { $in: idsArray } });

            if (stories.length > 0) {
                const cover = stories[0].image; // Assuming each story has an 'image' field
                res.status(200).json({ success:true, loginuser, cover, ids: idsArray });
            } else {
                res.status(404).json({ success:false, error: "No stories found for the user" });
            }
        } else {
            res.status(400).json({ success:false, error: "No IDs provided" });
        }
    } catch (error) {
        res.status(500).json({  success:false, message: error.message });
    }
}


exports.addHighlights = async (req, res) => {
    try {
        // Verify user authentication
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(403).json({ success: false, message: "User not found" });
        }

        // Destructure ids and title from the request body
        let { ids, title } = req.body;
        if (!ids || !title) {
            return res.status(400).json({ success: false, message: "Please provide both ids and title to create highlights." });
        }

        title = title.trim() || "Untitled";

        // Validate that ids is an array
        if (!Array.isArray(ids)) {
            return res.status(400).json({ success: false, error: "Invalid format for 'ids'. It should be an array." });
        }

        // Clean up the ids by trimming whitespace
        ids = ids.map(id => id.trim());

        // Fetch stories corresponding to the provided ids
        const storiesPromises = ids.map(async (id) => {
            try {
                const story = await storyModel.findById(id);
                if (!story) {
                    return res.status(404).json({ success: false, message: `Story not found for ID: ${id}` });
                }
                return story;
            } catch (err) {
                console.error(`Error fetching story with ID ${id}:`, err);
                return null;
            }
        });

        // Resolve all story fetch promises
        const stories = await Promise.all(storiesPromises);

        // Filter out any null values in case some stories were not found
        const validStories = stories.filter(story => story !== null);

        // Create a new highlight with the fetched stories
        const newHighlight = await HighlightModel.create({
            title,
            user: loggedInUser._id,
            coverphoto: req.params.cover,
            stories: validStories,
        });

        // Update the user's highlights
        loggedInUser.highlights.push(newHighlight._id);
        await newHighlight.populate("stories");
        await newHighlight.save();
        await loggedInUser.save();

        req.flash("success", "Highlight created successfully.");
        const message = req.flash("success");
        res.status(201).json({ success: true, message, highlight: newHighlight });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.getHighlights = async (req, res) => {
    try {
        const userId = req.query.userId || req.params.userId;
        if(! userId) return res.status(403).json({success:false, message : "please provide userId for get highligjts"})

        const user = await userModel.findById(userId);
        if (! user) return res.status(403).json({ success: false, message: "User not found" });

        // Fetch all highlights for the logged-in user
        const highlights = await HighlightModel.find({ user: user._id }).populate("stories");

        if(highlights.length == 0) return res.status(403).json({success:false, message : "you Dont have any highligjts"})

        // Return all highlights in JSON format
        res.status(200).json({ success: true, highlights });
    } catch (error) {
        // Handle errors by returning a 500 status code and the error message
        res.status(500).json({ success: false, message: error.message });
    }
}