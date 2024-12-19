
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary.config');
const Grid = require('gridfs-stream');
const reelsModel = require("../models/reels.model");




// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});





exports.uploadReel = async (req, res) => {
    try {
        // Input validation
        const { caption } = req.body;
        if (!caption || caption.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Caption is required"
            });
        }

        // Check if file exists in GridFS
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No video file uploaded"
            });
        }

        // Verify that the file was properly saved in GridFS
        const file = await gfs.files.findOne({ filename: req.file.filename });
        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found in GridFS. It may have been uploaded in chunks but not fully saved."
            });
        }

        // Cloudinary upload function
        const cloudinaryUpload = () => {
            return new Promise((resolve, reject) => {
                // Create download stream from GridFS
                const downloadStream = gfs.createReadStream({
                    filename: req?.file?.filename
                });

                // Cloudinary upload stream
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "reels",
                        chunk_size: 6000000
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                // Pipe GridFS stream to Cloudinary
                downloadStream.pipe(uploadStream);

                // Handle stream errors
                downloadStream.on('error', (err) => {
                    reject(new Error(`GridFS stream error: ${err.message}`));
                });
            });
        };

        // Upload to Cloudinary
        const cloudinaryResponse = await cloudinaryUpload();

        // Validate video duration
        const videoDuration = cloudinaryResponse.duration || 0;
        if (videoDuration > 60) {
            // Delete Cloudinary upload if too long
            await cloudinary.uploader.destroy(cloudinaryResponse.public_id);

            return res.status(400).json({
                success: false,
                message: "Video duration cannot exceed 60 seconds",
                actualDuration: videoDuration
            });
        }

        // Create reel entry
        const newReel = new reelsModel({
            user: req.user.userId,
            caption: caption.trim(),
            videoUrl: cloudinaryResponse.secure_url,
            cloudinaryPublicId: cloudinaryResponse.public_id,
            duration: videoDuration
        });

        // Save reel
        await newReel.save();

        // Optional: Delete file from GridFS after successful upload
        await gfs.files.deleteOne({ filename: req.file.filename });

        // Success response
        res.status(201).json({
            success: true,
            message: "Reel uploaded successfully",
            reel: {
                id: newReel._id,
                caption: newReel.caption,
                videoUrl: newReel.videoUrl
            }
        });

    } catch (error) {
        console.error("Reel Upload Error:", error);

        // Specific error handling for GridFS chunk upload issue
        if (error.message.includes("chunks not found")) {
            return res.status(500).json({
                success: false,
                message: "File upload was incomplete or corrupted. Please try uploading the video again."
            });
        }

        // Specific error handling for file size
        if (error.message.includes("File size too large")) {
            return res.status(413).json({
                success: false,
                message: "File is too large. Maximum size is 50MB."
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            message: "Internal server error during reel upload",
            error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
        });
    }
};




// Optional: Cleanup method for failed uploads
exports.cleanupFailedUpload = async (cloudinaryPublicId) => {
    if (cloudinaryPublicId) {
        try {
            await cloudinary.uploader.destroy(cloudinaryPublicId);
        } catch (error) {
            console.error("Cleanup failed for Cloudinary upload:", error);
        }
    }
};




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
