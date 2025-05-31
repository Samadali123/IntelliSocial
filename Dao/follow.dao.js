const userModel = require('../models/user.model');

// Add follower to user
const addFollower = async (userId, followerId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $push: { followers: followerId } },
        { new: true }
    );
};

// Remove follower from user
const removeFollower = async (userId, followerId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $pull: { followers: followerId } },
        { new: true }
    );
};

// Add following to user
const addFollowing = async (userId, followingId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $push: { following: followingId } },
        { new: true }
    );
};

// Remove following from user
const removeFollowing = async (userId, followingId) => {
    return await userModel.findByIdAndUpdate(
        userId,
        { $pull: { following: followingId } },
        { new: true }
    );
};

// Get user followers with populated fields
const getUserFollowers = async (email) => {
  const user = await userModel.findOne({ email })
    .populate({
      path: 'followers',
      select: 'username email profile' // or whatever you need
    });
  return user;
};

const getUserFollowing = async (email) => {
  const user = await userModel.findOne({ email })
    .populate({
      path: 'following',
      select: 'username email profile'
    });
  return user;
};




// Check if user is following another user
const isFollowing = async (userId, followingId) => {
    const user = await userModel.findById(userId);
    return user.following.includes(followingId);
};

// Check if user is followed by another user
const isFollowedBy = async (userId, followerId) => {
    const user = await userModel.findById(userId);
    return user.followers.includes(followerId);
};

module.exports = {
    addFollower,
    removeFollower,
    addFollowing,
    removeFollowing,
    getUserFollowers,
    getUserFollowing,
    isFollowing,
    isFollowedBy
};
