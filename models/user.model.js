const mongoose = require('mongoose');
const highlights = require('./highlights.model');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required "],
        minLength: [3, "username must be at least 3 characters"],
        maxLength: [15, "username should not exceed 15 characters."],
        unique: [true, "This username is not available"],
        trim: true
    },

    fullname: {
        type: String,
    },

 
    email: {
        type: String,
        require: [true, "email is required "],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique: true,
    },
    profile: {
        type: String,
        default: "https://res.cloudinary.com/dkkrycya8/image/upload/v1730454271/4a0f8187-7eae-4795-bca3-d79c0ac0b8ce_gv5ngq.jpg"
    },

    password:{
        type :String,
        required:[true, "Password is required"],
    },
    bio: {
        type: String,
        trim: true,
        minLength: [10, "Bio must contain at least 10 characters long"],
        maxLength: [300, 'Bio should not exceed 300 characters'],
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `post`
    }],

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `user`
    }],

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `user`
    }],

    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `post`
    }],

    stories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `story`
    }],

    resetpasswordtoken: {
        type: String,
        default: "0"
    },

    likedstories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `story`
    }],
    myStories: {
        type: Array,
        default: []
    },
    note: {
        type: String,
        default: "Add a note"
    },
    highlights: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "highlights"
    }],

    deletedContent: {
        type: Array,
        default: []
    },
    Date: {
        type: Date,
        default: Date.now
    },
    privateAccount: {
        type: Boolean,
        default: false 
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    blockedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    reels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "reels"
    }]
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model(`user`, userSchema);
