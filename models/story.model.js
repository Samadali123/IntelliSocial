const mongoose = require('mongoose');
const User = require('./user.model'); 

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Ensure the correct reference to the User model
        required: [true, "User is required for creating a story"]
    },
    image: {
        type: String,
        required: [true, "Image is required for creating a story"]
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    expiryDate: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
}, { timestamps: true, versionKey: false });

// Index to automatically delete stories after they expire
storySchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

// Middleware to handle user stories array when a story is deleted
storySchema.pre('remove', async function(next) {
    try {
        const story = this;
        await User.updateOne({ _id: story.user }, { $pull: { stories: story._id } });
        next();
    } catch (error) {
        next(error);
    }
});

// Ensure expired stories are also cleaned up
storySchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        try {
            await User.updateOne({ _id: doc.user }, { $pull: { stories: doc._id } });
        } catch (error) {
            console.error('Error updating user stories array:', error);
        }
    }
});

// Automatically remove expired stories from the database
storySchema.pre('save', function(next) {
    if (this.isNew) {
        this.expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiry date for new stories
    }
    next();
});

const Story = mongoose.model('story', storySchema);

module.exports = Story;
