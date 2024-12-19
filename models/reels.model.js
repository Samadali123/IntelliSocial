// const mongoose = require("mongoose");

// const reelsSchema = new mongoose.Schema(
//     {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "user",
//             required: true,
//         },
//         caption: {
//             type: String,
//             required: true,
//         },
//         duration: {
//             type: Number,
//             required: true,
//             validate: {
//                 validator: function (v) {
//                     return v <= 60; // Duration cannot exceed 60 seconds
//                 },
//                 message: "Duration cannot exceed 60 seconds",
//             },
//         },
//         videoUrl: {
//             type: String,
//             required: true,
//         },
//         savedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "user"
//         },
//         likedby: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "user"
//         },
//         comments: [{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: `reelComment`
//         }],
//         views: {
//             type: Number,
//             default: 0, // Initialize views to 0
//         },
//     },
//     { timestamps: true }
// );

// module.exports = mongoose.model("reel", reelsSchema);



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
            required: [true, "Caption is required"],
            trim: true,
            maxlength: [200, "Caption cannot exceed 200 characters"]
        },
        duration: {
            type: Number,
            required: [true, "Video duration is required"],
            validate: {
                validator: function (v) {
                    return v <= 60; // Duration cannot exceed 60 seconds
                },
                message: "Duration cannot exceed 60 seconds"
            }
        },
        videoUrl: {
            type: String,
            required: [true, "Video URL is required"],
            validate: {
                validator: function(v) {
                    // Optional: Add URL validation if needed
                    return /^https?:\/\/.+/.test(v);
                },
                message: "Please provide a valid video URL"
            }
        },
        cloudinaryPublicId: {
            type: String,
            required: [true, "Cloudinary Public ID is required"]
        },
        savedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }],
        likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }],
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "reelComment"
        }],
        views: {
            type: Number,
            default: 0, // Initialize views to 0
            min: [0, "Views cannot be negative"]
        },
        // Optional: Add more metadata if needed
        isPublic: {
            type: Boolean,
            default: true
        }
    },
    { 
        timestamps: true,
        // Add this to improve query performance
        indexes: [
            { user: 1 },
            { createdAt: -1 }
        ]
    }
);

// Optional: Pre-save hook for additional validation
reelsSchema.pre('save', function(next) {
    // Additional custom validation or processing
    if (this.duration > 60) {
        return next(new Error('Reel duration cannot exceed 60 seconds'));
    }
    next();
});

// Optional: Method to check if reel is recent
reelsSchema.methods.isRecent = function() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.createdAt > twentyFourHoursAgo;
};

// Optional: Static method to find recent reels
reelsSchema.statics.findRecent = function() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.find({ createdAt: { $gte: twentyFourHoursAgo } });
};

module.exports = mongoose.model("reel", reelsSchema);