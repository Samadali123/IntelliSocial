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
        savedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        likedby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: `reelComment`
        }],
        views: {
            type: Number,
            default: 0, // Initialize views to 0
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("reel", reelsSchema);
