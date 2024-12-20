const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    caption: {
        type: String,
        required: true,
    },

    image: {
        type: [String],
        required: true
      },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `user`,
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `user`,
    }],


    createdAt: {
        type: Date,
        default: Date.now(),
    },

    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `user`,
    }],

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `comment`
    }],

    commentsEnabled: {
        type: Boolean,
        default: true
    },

    hidelikes: {
        type: Boolean,
        default: false,
    },
    pinned: {
        type: Boolean,
        default: false
    }
}, {versionKey : false, timeStamps : true})




module.exports = mongoose.model(`post`, postSchema);