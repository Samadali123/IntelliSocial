
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary.config');
const Grid = require('gridfs-stream');
const reelsModel = require("../models/reels.model");



// Initialize GridFS
const connection = mongoose.connection;
let gfs;

connection.once("open", () => {
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection("uploads"); // Replace with your bucket name if different
});



exports.uploadReelToCloudinary = async (req, res) => {
    try {
        const { caption } = req.body;

        // Validate request body
        if (!caption) {
            return res.status(400).json({
                success: false,
                message: "Caption is required.",
            });
        }

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No video file uploaded.",
            });
        }

        // Find the file in GridFS
        const file = await gfs.files.findOne({ filename: req.file.filename });
        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found in GridFS.",
            });
        }

        // Create a read stream for the file
        const readStream = gfs.createReadStream({ _id: file._id });

        // Upload the file to Cloudinary
        const cloudinaryResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "video", folder: "reels" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            readStream.on("error", (err) => {
                reject(new Error("Error reading the file from GridFS: " + err.message));
            });

            readStream.pipe(uploadStream);
        });

        // Analyze duration from the video URL
        const videoDuration = cloudinaryResponse.duration; // Assuming Cloudinary returns duration in seconds
        if (videoDuration > 60) {
            return res.status(400).json({
                success: false,
                message: "Duration exceeded: Video duration cannot exceed 60 seconds.",
            });
        }

        // Save the reel details to the database
        const reel = new reelsModel({
            user: req.user.userId,
            caption,
            videoUrl: cloudinaryResponse.secure_url,
            duration: videoDuration, // Save the duration
            views: 0,
        });

        await reel.save();

        // Respond with success
        res.status(201).json({
            success: true,
            message: "Reel uploaded successfully.",
            reel,
        });
    } catch (error) {
        console.error("Error in uploadReelToCloudinary:", error.message);

        // Check for specific error related to file processing
        if (error.message.includes("Cannot read properties of undefined") || error.message.includes("File not found in GridFS")) {
            return res.status(500).json({
                success: false,
                message: "File processing error: The file may not exist in GridFS.",
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Error uploading reel.",
            error: error.message,
        });
    }
}




exports.getAllReels = async (req, res) => {
    try {
        // Fetch all reels sorted by creation date (latest first)
        const reels = await reelsModel.find().sort({ createdAt: -1 });

        if (!reels.length) {
            return res.status(404).json({
                success: false,
                message: "No reels found",
            });
        }

        // Update the views count for all reels in bulk
        const updatedReels = await Promise.all(
            reels.map(async (reel) => {
                reel.views += 1;
                await reel.save();
                return reel;
            })
        );

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

        // Validate the provided reel ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid reel ID.",
            });
        }

        // Fetch the reel by ID
        const reel = await reelsModel.findById(id);

        // Check if the reel exists
        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found.",
            });
        }

        // Increment the view count and save the reel
        reel.views += 1;
        await reel.save();

        res.status(200).json({
            success: true,
            message: "Reel fetched successfully.",
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

        // Validate reel ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Please provide the ID of the reel.",
            });
        }

        const { caption } = req.body;

        // Validate the new caption
        if (!caption) {
            return res.status(400).json({
                success: false,
                message: "Please provide a new caption to update.",
            });
        }

        // Find the reel by ID
        const reel = await reelsModel.findById(id);

        // Check if the reel exists
        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found.",
            });
        }

        // Update the caption
        reel.caption = caption;
        await reel.save();

        res.status(200).json({
            success: true,
            message: "Reel caption updated successfully.",
            reel,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating reel caption.",
            error: error.message,
        });
    }
};




exports.deleteReel = async (req, res) => {
    try {
        const { id } = req.params || req.query;

        // Validate the reel ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Please provide the ID of the reel.",
            });
        }

        // Find the reel by ID
        const reel = await reelsModel.findById(id);

        // Check if the reel exists
        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found.",
            });
        }

        // Extract public IDs for video and thumbnail from Cloudinary URLs
        const videoPublicId = reel.videoUrl.split("/").pop().split(".")[0];
        const thumbnailPublicId = reel.thumbnailUrl.split("/").pop().split(".")[0];

        // Delete video and thumbnail from Cloudinary
        await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
        await cloudinary.uploader.destroy(thumbnailPublicId);

        // Remove the reel from the database
        await reelsModel.findByIdAndDelete(id);

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

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid user ID.",
            });
        }

        // Fetch all reels created by the specified user, sorted by creation date (latest first)
        const userReels = await reelsModel.find({ user: userId }).sort({ createdAt: -1 });

        // Check if any reels exist for the user
        if (!userReels || userReels.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reels found for this user.",
            });
        }

        // Respond with the reels (views will not be incremented on fetch)
        res.status(200).json({
            success: true,
            reels: userReels,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reels for the user.",
            error: error.message,
        });
    }
};
