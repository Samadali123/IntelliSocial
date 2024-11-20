const reelsModel = require("../models/reels.model");

exports.uploadReelWithThumbnail = async (req, res) => {
    try {
        const { caption, duration } = req.body;
        if (!caption || !duration) return res.status(403).json({ success: false, message: "Please provide caption and duration of reel" })

        if (duration > 60) {
            return res.status(400).json({ message: "Duration cannot exceed 60 seconds" });
        }

        // Extract uploaded file URLs
        const videoUrl = req.files.video[0].path;
        const thumbnailUrl = req.files.thumbnail[0].path;

        // Create a new reel
        const reel = new reelsModel({
            user: req.user.userid, // Assuming user ID is stored in req.user
            caption,
            duration,
            videoUrl,
            thumbnailUrl,
        });

        await reel.save();

        res.status(201).json({
            success: true,
            message: "Reel uploaded successfully.",
            reel,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error uploading reel.",
            error: error.message,
        });
    }
};



exports.getAllReels = async (req, res) => {
    try {
        // Fetch all reels sorted by creation date (latest first)
        const reels = await reelsModel.find().sort({ createdAt: -1 });

        if (reels.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reels found",
            });
        }

        // Increment views for each reel when fetched
        const updatedReels = [];
        for (let reel of reels) {
            // Increment the view count
            reel.views += 1;

            // Save the updated reel
            await reel.save();

            updatedReels.push(reel);
        }

        res.status(200).json({
            success: true,
            reels: updatedReels,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reels.",
            error: error.message,
        });
    }
};



exports.getReelById = async (req, res) => {
    try {
        const { id } = req.params || req.query;

        if (!id) {
            return res.status(404).json({ success: false, message: "Please provide an id of the reel" });
        }

        // Find the reel by ID
        const reel = await reelsModel.findById(id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found.",
            });
        }

        // Increment the view count
        reel.views += 1;

        // Save the updated reel with the new view count
        await reel.save();

        res.status(200).json({
            success: true,
            reel,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reel.",
            error: error.message,
        });
    }
};




exports.updateReel = async (req, res) => {
    try {
        const { id } = req.query || req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "Please provide the ID of the reel" });
        }

        const { caption } = req.body;
        const { videoUrl, thumbnailUrl } = req.files;

        if (!caption && !thumbnailUrl) {
            return res.status(400).json({ success: false, message: "Please provide at least one field to update: caption or thumbnail." });
        }

        // Find and update the reel
        const reel = await Reels.findById(id);
        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found.",
            });
        }

        // Only update the fields that are provided
        if (caption) {
            reel.caption = caption;
        }
        if (thumbnailUrl) {
            reel.thumbnailUrl = thumbnailUrl[0].path; // Assuming thumbnail file is uploaded and Cloudinary has returned a path
        }

        await reel.save();

        res.status(200).json({
            success: true,
            message: "Reel updated successfully.",
            reel,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating reel.",
            error: error.message,
        });
    }
};



exports.deleteReel = async (req, res) => {
    try {
        const { id } = req.params || req.query;
        if (!id) return res.status(404).json({ success: false, message: "Please provide if of a reel" })

        const reel = await reelsModel.findById(id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found.",
            });
        }

        // Delete video and thumbnail from Cloudinary
        const videoPublicId = reel.videoUrl.split("/").pop().split(".")[0];
        const thumbnailPublicId = reel.thumbnailUrl.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
        await cloudinary.uploader.destroy(thumbnailPublicId);

        // Delete reel from database
        await reel.remove();

        res.status(200).json({
            success: true,
            message: "Reel deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting reel.",
            error: error.message,
        });
    }
};



exports.getReelsByUser = async (req, res) => {
    try {
        const { userId } = req.params || req.query;
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "Please provide a user ID.",
            });
        }

        // Find reels for the specified user
        const userReels = await reelsModel.find({ user: userId }).sort({ createdAt: -1 });

        if (userReels.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reels found for this user.",
            });
        }

        // Increase the views for each reel
        for (let reel of userReels) {
            reel.views += 1; // Increment the views count by 1
            await reel.save(); // Save the updated reel back to the database
        }

        res.status(200).json({
            success: true,
            reels: userReels,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reels for user.",
            error: error.message,
        });
    }
};
