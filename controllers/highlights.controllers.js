const userModel = require("../models/user.model")
const HighlightModel = require("../models/highlights.model")
const storyModel = require("../models/story.model")
const mongoose = require("mongoose")



exports.getStoriesForHighlights = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("myStories");
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
        const loginuser = await userModel.findOne({ email: req.user.email });

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





exports.uploadHighlight = async (req, res) => {
    try {
        // Ensure the user is authenticated
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Extract ids and title from request body
        let { ids, title } = req.body;
        ids = JSON.parse(ids);

        if (!title) return res.status(400).json({ success: false, message: "Please provide title for highlight" });
        if (!ids) return res.status(400).json({ success: false, message: "Please provide ids for highlight" });

        if (!ids && !title) return res.status(400).json({ success: false, message: "Please Provide Ids and Title for uploading the Highlight" });

        title = title ? title.trim() : "Untitled";

        // Validate ids
        if (!Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: "Invalid Ids format It must be in an Array of Ids" });
        }

        // Trim any extra spaces from the IDs
        ids = ids.map(id => id.trim()).filter(id => id); // Filter out any empty strings

        // Fetch all stories for the ids
        const stories = await Promise.all(ids.map(async (id) => {
            try {
                const story = await storyModel.findById(id);
                if (!story) {
                    console.warn(`Story not found for id: ${id}`);
                    return null;
                }
                return story;
            } catch (err) {
                console.error(`Error fetching story with id ${id}:`, err);
                return null;
            }
        }));

        // Filter out any null values in case any stories were not found
        const filteredStories = stories.filter(story => story !== null);
        if (filteredStories.length === 0) {
            return res.status(404).json({ success: false, message: "No valid stories found for the provided IDs." });
        }

        // Check if the file is present before accessing its path
        if (!req.file || !req.file.path) {
            return res.status(400).json({ success: false, message: "Please provide a cover image for the highlight" });
        }

        // Create new highlight with fetched stories and cover photo from req.file.path
        const newHighlight = await HighlightModel.create({
            title,
            user: loginuser._id,
            stories: filteredStories,
            coverphoto: req.file.path // Use the cover photo URL from the uploaded file
        });

        loginuser.highlights.push(newHighlight._id);
        await newHighlight.populate("stories"); // Ensure stories are populated
        await newHighlight.save();
        await loginuser.save();
        req.flash("success", "Highlight created successfully.");
        res.status(201).json({ success: true, message: req.flash("success"), newHighlight });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", details: error.message });
    }
}



exports.getHighlights = async (req, res) => {
    try {
        const userId = req.query.userId || req.body.userId;
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




exports.getHighlightsOfLoginuser = async (req, res) => {
    try {
        const userId = req.user.userid;
        if(! userId) return res.status(400).json({success:false, message : "User is not Authenticated ,Please login to continue"});

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