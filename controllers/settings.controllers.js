const settingsDao = require('../Dao/settings.dao');
const userDao = require('../Dao/user.dao');
const commentModel = require("../models/comments.model")
const bcrypt = require("bcrypt");

exports.getSavedPosts = async (req, res) => {
    try {
        if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });
        const user = await settingsDao.getSavedPosts(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, savedPosts: user.savedPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLikedPosts = async (req, res) => {
    try {
                if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });
        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const likedPosts = await settingsDao.getLikedPosts(user._id);
        res.status(200).json({ success: true, likedPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getUserPosts = async (req, res) => {
    try {
                if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });
        const user = await settingsDao.getUserPosts(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, posts: user.posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserHighlights = async (req, res) => {
    try {
                if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });
        const user = await settingsDao.getUserHighlights(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, highlights: user.highlights });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleHighlight = async (req, res) => {
    try {
        const highlightId = req.params.highlightId ;
        if (!highlightId) {
            return res.status(400).json({ success: false, message: "Highlight ID is required" });
        }

        const highlight = await settingsDao.getSingleHighlight(highlightId);
        if (!highlight) {
            return res.status(404).json({ success: false, message: "Highlight not found" });
        }

        res.status(200).json({ success: true, highlight });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getArchiveStory = async (req, res) => {
    try {
        const storyId = req.params.storyId ;
        if (!storyId) {
            return res.status(400).json({ success: false, message: "Story ID is required" });
        }

        const story = await settingsDao.getArchiveStory(storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }

        res.status(200).json({ success: true, story });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSinglePost = async (req, res) => {
    try {
        const postId = req.params.postId ;
        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required" });
        }

        const post = await settingsDao.getSinglePost(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOpenUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId ;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await settingsDao.getOpenUserPosts(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOpenUserLikedPosts = async (req, res) => {
    try {
        const userId =  req.query.userId;
        const postId =  req.query.postId;
        if (!userId || !postId) {
            return res.status(400).json({ success: false, message: "User ID and Post ID are required" });
        }

        const { openPost, randomPosts } = await settingsDao.getOpenUserLikedPosts(userId, postId);
        if (!openPost) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, openPost, randomPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeUserContent = async (req, res) => {
    try {
        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updatedUser = await settingsDao.removeUserContent(user._id);
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Failed to remove user content" });
        }

        res.status(200).json({ success: true, message: "User content removed successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLoginuserCommentsOnPosts = async (req, res, next) => {
    try {
        if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });
        const loginuser = await userDao.findByEmail(req.user.email);

        if (!loginuser) {
            return res.status(404).json({ message: "User not found" });
        }
       
        // Find all comments made by the logged-in user and populate the post field
        const userComments = await commentModel.find({ user: loginuser._id })
            .populate({
                path: 'post',
                populate: {
                    path: 'user', // populate the user field in the post
                    select: '_id username profile' // selecting only necessary fields
                }
            }).populate('user'); // populate the user who made the comment

        // Helper function to calculate relative time
        function getRelativeTime(date) {
            const now = new Date();
            const diff = now - new Date(date);
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);

            if (years > 0) return `${years}yr${years > 1 ? 's' : ''}`;
            if (months > 0) return `${months}mon${months > 1 ? 's' : ''}`;
            if (days > 0) return `${days}d${days > 1 ? 'ays' : 'ay'} `;
            if (hours > 0) return `${hours}hr${hours > 1 ? 's' : ''} `;
            if (minutes > 0) return `${minutes}min${minutes > 1 ? 's' : ''} `;
            return `${seconds}s${seconds > 1 ? 's' : ''}`;
        }

        // Format the createdAt dates for comments and posts
        userComments.forEach(comment => {
            comment.formattedCreatedAt = getRelativeTime(comment.createdAt);
            if (comment.post) {
                comment.post.formattedCreatedAt = getRelativeTime(comment.post.createdAt);
            }
        });
        res.status(200).json({ success:true, userComments, loginuser });
       
    } catch (error) {
        res.status(500).json({success:false, message:error.message });
    }
}

exports.getpostCommentsonPost= async (req, res) => {
    try {
        const postId =  req.params.postId;
        if(!postId) return res.status(403).json({success:false, message: "please provide postid"})
        const post = await postModel.findById(postId);
       if(! post) return   res.status(403).json({success:false, message: "post not found!! "})
        const comments = await commentModel.find({ post: post._id }).populate('user')
       if(comments.length == 0) return  res.status(403).json({success:false, message: "not have any comments on this post..."})
        comments.forEach((comment) => {
            let dateObj = new Date(comment.createdAt);
            let monthNames = [
                '', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            let day = dateObj.getDate();
            let month = dateObj.getMonth() + 1;
            let year = dateObj.getFullYear();

            let monthName = monthNames[month];
            let formattedDate = `${monthName} ${day}, ${year}`;
            comment.formattedDate = formattedDate;
        });
        const loginuser = await userDao.findByEmail(req.user.email);
        if(! loginuser) return res.status(403).json({success:false, message : "login user not found"})
        res.status(200).json({ success:true, loginuser, comments, post });
    } catch (error) {
        res.status(500).json({success:false, message:error.mesage})
    }
}

exports.getAboutofLoginuser = async (req, res) => {
    try {
        if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });
        const loginuser = await userDao.findByEmail(req.user.email);

        if (loginuser && loginuser.Date) {  // Replace 'dateField' with the actual field name in your model
            const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
            loginuser.formattedDate = dateFormatter.format(new Date(loginuser.Date));
        }

        res.status(200).json({ success:true, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.loginuserAccountToggle = async (req, res) => {
    try {
        if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });
        // Find the user by email and toggle the privateAccount field
        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        loginuser.privateAccount = !loginuser.privateAccount;
        await loginuser.save();
        res.status(200).json({ success: true, loginuser: loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.resetPasswordofLoginuser = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const loginuser = await userDao.findByEmail(req.user.email); // Assuming user ID is attached to req.user

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    try {
        // Find user by ID
        const user = await userDao.findById(loginuser._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect, forgot your password' });
        }

        // Hash new password and update user record
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
       res.status(500).json({success:false, message:error.message})
    };
}

exports.blockUser = async (req, res, ) => {
    try {

        if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        // Fetch the logged-in user from the database
        const loginUser = await userDao.findByEmail(req.user.email);
        if (!loginUser) {
            return res.status(403).json({ success: false, message: "Logged-in user not found!" });
        }


        // Fetch the user to be blocked from the database
        const userToBlock = await userDao.findById(userId);
        if (!userToBlock) {
            return res.status(403).json({ success: false, message: "User to block not found. Please provide a valid user ID." });
        }

        // Prevent the user from blocking themselves
        if (loginUser._id.equals(userToBlock._id)) {
            return res.status(403).json({ success: false, message: "You cannot block yourself." });
        }

        // Check if the user is already blocked
        if (loginUser.blockedUsers.includes(userToBlock._id)) {
            return res.status(200).json({
                success: false,
                message: "You have already blocked this account.",
            });
        }

        // Add the user to blocked users list and save both users
        loginUser.blockedUsers.push(userToBlock._id);
        userToBlock.blockedBy.push(loginUser._id);

        await loginUser.save();
        await userToBlock.save();

        return res.status(200).json({
            success: true,
            message: "User successfully blocked.",
            loginUser,
            userToBlock
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

exports.getBlockedAccounts = async (req, res) => {
    try {
        const loginuser = await userDao.findByEmail(req.user.email);
        return res.status(200).json({ success: true, loginuser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.unblockUser = async (req, res) => {
    try {
        if(! req.user.email) return res.status(403).json({ success: false, message: "User not Authorized" });

        // Find the logged-in user by their email
        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) {
            return res.status(403).json({ success: false, message: "Login user not found! Please login to continue." });
        }
         const { userId } = req.body
        const userToUnblockId = userId

        // Ensure the user is not trying to unblock themselves
        if (loginuser._id.toString() === userToUnblockId.toString()) {
            return res.status(400).json({ success:false, message: "You cannot unblock yourself." });
        }

        // Find the user to unblock by their ID
        const userToUnblock = await userDao.findById(userToUnblockId);
        if (!userToUnblock) {
            return res.status(404).json({ success:false, message: 'User to unblock not found.' });
        }

        // Check if the user is actually blocked
        if (!loginuser.blockedUsers.includes(userToUnblockId)) {
            return res.status(400).json({ success:false,message: "This account is not in your blocked list." });
        }

        // Remove userToUnblockId from loginuser's blockedUsers array
        loginuser.blockedUsers = loginuser.blockedUsers.filter(id => id.toString() !== userToUnblockId.toString());

        // Remove loginuser._id from userToUnblock's blockedBy array
        userToUnblock.blockedBy = userToUnblock.blockedBy.filter(id => id.toString() !== loginuser._id.toString());

        // Save both updated user documents
        await loginuser.save();
        await userToUnblock.save();

        res.status(200).json({ success: true, message: 'User successfully unblocked.' });

    } catch (error) {
        res.status(500).json({ success:false, message: error.mesage});

    }
}