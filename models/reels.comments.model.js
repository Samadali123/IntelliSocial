const mongoose = require('mongoose');

const reelsCommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'User is required']
    },
    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reel',
      required: [true, 'Reel is required']
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);


module.exports = mongoose.model('reelComment', commentSchema);