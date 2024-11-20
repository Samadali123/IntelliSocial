const mongoose = require("mongoose");

const reelsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        caption: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return v <= 60; // Duration cannot exceed 60 seconds
                },
                message: "Duration cannot exceed 60 seconds",
            },
        },
        videoUrl: {
            type: String,
            required: true,
        },
        thumbnailUrl: {
            type: String,
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        views: {
            type: Number,
            default: 0, // Initialize views to 0
        },
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user",
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now, // Timestamp for when the comment was created
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Reels", reelsSchema);
