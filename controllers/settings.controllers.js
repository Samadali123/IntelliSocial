const userModel = require("../models/user.model")
const postModel = require("../models/post.model")
const HighlightModel = require("../models/highlights.model")
const storyModel = require("../models/story.model")
const commentModel = require("../models/comments.model")
const utils = require("../utils/date.utils")




exports.getLoginUserSavedPosts = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("savedPosts");
        
        // Check if the user was found
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Check if the user has saved posts
        if (!loginuser.savedPosts || loginuser.savedPosts.length === 0) {
            return res.status(200).json({ success: true, message: "No saved posts found.", savedPosts: [] });
        }

        res.status(200).json({ success: true, savedPosts: loginuser.savedPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.getOpenUserPosts = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("followers").populate("following");
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "Logged-in user not found!" });
        }

        if(! req.params.openuserId || ! req.query.openuserId) return res.status(404).json({success:false, message : "Please provide open user Id"})
        const openUser = await userModel.findById(req.params.openuserid || req.query.openuserid).populate("followers").populate("following");
        if (!openUser) {
            return res.status(404).json({ success: false, message: "Open user not found!" });
        }
       
        if(! req.query.openpostId || !req.params.openpostId) return res.status(404).json({success:false, message : "Pleaee provide PostId"})

        const openPost = await postModel.findById(req.params.openpostId).populate("user");
        if (!openPost) {
            return res.status(403).json({ success: false, message: "Post not found!" });
        }

        const count = await postModel.countDocuments();
        if (count === 0) {
            return res.status(200).json({ success: true, loginuser, posts: [], openUser, message: "No posts available." });
        }

        const randomIndex = Math.floor(Math.random() * count);
        const randomPosts = await postModel.find().skip(randomIndex).limit(19).populate("user");
        let posts = [openPost, ...randomPosts];
        res.status(200).json({ success: true, loginuser, posts, openUser, dater: utils.formatRelativeTime });
    } catch (error) {
      res.status(500).json({success:false, message: error.mesage})
    }
}





exports.getArchieveStory = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        const storyId = req.query.storyId || req.params.storyId;
        if(! storyId)  return res.status(403).json({success:false, message: "please provide stoyrid"})
        const story = await storyModel.findById(storyId).populate("user");
        if(! story) return res.status(403).json({success:false, message: "Story not found!!!"})
       res.status(200).json({success:false, loginuser, story, dater:utils.formatRelativeTime})
    } catch (error) {
        res.status(500).json({success:false, nessage:error.message })
    }
}





exports.getLoginuserLikedPosts = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        const userPosts = await postModel.find({ likes: loginuser._id }).populate("user");
        if(userPosts.length == 0){
            res.status(403).json({success:false, message: "Posts not found!!!"})
        }
        res.status(200).json({ success:true, loginuser, userPosts });
    } catch (error) {
        res.status(500).json({success:false, message:error.mesage });
    }
}


exports.getLoginuserCommentsOnPosts = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });

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
        const postId = req.query.postId || req.params.postId;
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
        const loginuser = await userModel.findOne({ email: req.user.email });
        if(! loginuser) return res.status(403).json({success:false, message : "login user not found"})
        res.status(200).json({ success:true, loginuser, comments, post });
    } catch (error) {
        res.status(500).json({success:false, message:error.mesage})
    }
}




exports.getOpenuserLikedonPost = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("followers").populate("following");
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if(! req.query.userId || ! req.params.userId) return res.status(404).json({success:false, message : "Please provide UserId"})

        const openUser = await userModel.findById(req.params.userId).populate("followers").populate("following");
        if (!openUser) {
            return res.status(404).json({ success: false, message: "Open user not found!" });
        }

        
        if(! req.query.postId || ! req.params.postId) return res.status(404).json({success:false, message : "Please provide UserId"})
        const openPost = await postModel.findById(req.params.postId || req.query.postId).populate("user");
        if (!openPost) {
            return res.status(404).json({ success: false, message: "Post not found!" });
        }

        const count = await postModel.countDocuments();
        if (count === 0) {
            return res.status(404).json({ success: false, message: "No posts available!" });
        }

        const randomIndex = Math.floor(Math.random() * count);
        const randomPosts = await postModel.find().skip(randomIndex).limit(19).populate("user");
        let posts = [openPost, ...randomPosts];

        res.status(200).json({ success: true, posts, loginuser, openUser, dater: utils.formatRelativeTime });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while processing your request." });
    }
}





exports.getLoginuserPosts = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("posts");
        
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if(loginuser.posts.length == 0) return res.status(403).json({success:false, message : "soory you have'nt any posts..."})
        res.status(200).json({ success: true, footer: true, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message:error.message });
    }
}



exports.getSinglePost = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if(! req.query.postId || ! req.params.postId) return res.status(404).json({success:false, message: "Please provide PostId "})

        const openPost = await postModel.findById(req.params.postid || req.query.postid).populate("user");
        if (!openPost) {
            return res.status(404).json({ success: false, message: "Post not found!" });
        }

        res.status(200).json({
            openPost,
            loginuser,
            dater: utils.formatRelativeTime
        });
    } catch (error) {
        res.status(500).json({ success: false,  message: error.message });
    }
}



exports.getLoginuserHighlights = async (req, res, next) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("highlights");

        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if (!loginuser.highlights || loginuser.highlights.length === 0) {
            return res.status(204).json({ success: true, message: "No highlights available." });
        }

        res.status(200).json({ success:true, loginuser , highlights: loginuser.highlights });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



exports.getSingleHighlight = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Fetch the highlight
        if(! req.query.highlightId || ! req.params.highlightId) return res.status(404).json({success:false, message: "Please provide HighlightUd"})

        const highlight = await HighlightModel.findById(req.query.highlightId || req.params.highlightId);
        if (!highlight) {
            return res.status(404).json({ success: false, message: "Highlight not found!" });
        }

        // Ensure the stories array has the element at the specified index
        if (highlight.stories && highlight.stories.length > req.params.number) {
            let highlightimage = highlight.stories[req.params.number].image;

            return res.status(200).json({
                success: true,
                highlightimage,
                loginuser,
                number: req.params.number,
            });
        } else {
            return res.status(204).json({ success: false, message: "No further stories available." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



exports.removeLoginuserContent = async (req, res) => {
    try {
        async function deleteUserContent(userId) {
            try {
                // Fetch the user by ID and populate references
                const user = await userModel.findById(userId).populate('posts highlights stories');
                if (!user) {
                    res.status(403).json({success:false, message: "user not found"})
                }

                // Check if user has content
                if (user.posts.length === 0 && user.highlights.length === 0 && user.stories.length === 0) {
                    return { success: false, message: 'No content to delete' }; // Return a specific message if no content is found
                }

                // Delete all posts
                await postModel.deleteMany({ _id: { $in: user.posts } });

                // Delete all highlights
                await HighlightModel.deleteMany({ _id: { $in: user.highlights } });

                // Delete all stories
                await storyModel.deleteMany({ _id: { $in: user.stories } });

                // Clear references in the user document
                user.posts = [];
                user.highlights = [];
                user.stories = [];
                await user.save();

                return { success: true, message: 'Content removed successfully' }; // Return a success message
            } catch (error) {
                return { success: false, message: error.message }; // Return error message
            }
        }

        // Find the logged-in user
        const loginUser = await userModel.findOne({ email: req.user.email });

        if (!loginUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Call the function to delete content
        const result = await deleteUserContent(loginUser._id);

        if (!result.success) {
            // Send a message if no content was found
            return res.status(200).json(result);
        }

        // Return success response if content was successfully removed
        return res.status(200).json(result);
    } catch (error) {
        // Handle errors
        return res.status(500).json({ success: false, message: error.message });
    }
}





exports.getAboutofLoginuser = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });

        if (loginuser && loginuser.Date) {  // Replace 'dateField' with the actual field name in your model
            const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
            loginuser.formattedDate = dateFormatter.format(new Date(loginuser.Date));
        }

        res.status(200).json({ footer: true, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}







exports.loginuserAccountToggle = async (req, res) => {
    try {
        // Find the user by email and toggle the privateAccount field
        const loginuser = await userModel.findOne({ email: req.user.email });
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




exports.resetPasswordofLoginuser = async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const loginuser = await userModel.findOne({ email: req.user.email }); // Assuming user ID is attached to req.user

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    try {
        // Find user by ID
        const user = await userModel.findById(loginuser._id);
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
       res.status(500).json({success:false, message:error.mesage})
    };
}




exports.blockUser = async (req, res, ) => {
    try {

        // Fetch the logged-in user from the database
        const loginUser = await userModel.findOne({ email: req.user.email });
        if (!loginUser) {
            return res.status(403).json({ success: false, message: "Logged-in user not found!" });
        }

        // Fetch the user to be blocked from the database
        const userToBlock = await userModel.findById(req.body.userId);
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
        const loginuser = await userModel.findOne({ email: req.user.email }).populate("blockedUsers");
        return res.status(200).json({ success: true, loginuser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


exports.unblockUser = async (req, res) => {
    try {
        // Find the logged-in user by their email
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) {
            return res.status(403).json({ success: false, message: "Login user not found! Please login to continue." });
        }

        const userToUnblockId = req.body.id;

        // Ensure the user is not trying to unblock themselves
        if (loginuser._id.toString() === userToUnblockId.toString()) {
            return res.status(400).json({ message: "You cannot unblock yourself." });
        }

        // Find the user to unblock by their ID
        const userToUnblock = await userModel.findById(userToUnblockId);
        if (!userToUnblock) {
            return res.status(404).json({ message: 'User to unblock not found.' });
        }

        // Check if the user is actually blocked
        if (!loginuser.blockedUsers.includes(userToUnblockId)) {
            return res.status(400).json({ message: "This account is not in your blocked list." });
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
        res.status(500).json({ message: error.mesage});

    }
}