const postDao = require('../Dao/post.dao');
const userDao = require('../Dao/user.dao');
const commentModel = require("../models/comments.model")
const utils = require("../utils/date.utils")
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
    try {
        if (!req.files ) {
            return res.status(400).json({ success: false, message: "Please provide an Image to uploadd" });
        }

        if (!req.body.caption) {
            return res.status(400).json({ success: false, message: "Please provide a caption" });
        }

        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Store all image URLs (from Cloudinary)
        const imageUrls = req.files.map(file => file.path);

        const newPost = await postDao.createPost({
            user: user._id,
            image: imageUrls, 
            caption: req.body.caption
        });

        await userDao.addPost(user._id, newPost._id);

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getPosts = async (req, res) => {
    try {
        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const posts = await postDao.findByUserIdWithPopulate(user._id, 'user comments');
        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSinglePost = async (req, res) => {
    try {
        const postId = req.params.postId || req.query.postId;
        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required" });
        }

        const post = await postDao.findByIdWithPopulate(postId, 'user comments');
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const postId = req.params.postId || req.query.postId;
        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required" });
        }

        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const post = await postDao.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const isLiked = post.likes.includes(user._id);
        if (isLiked) {
            await postDao.removeLike(postId, user._id);
        } else {
            await postDao.addLike(postId, user._id);
        }

        res.status(200).json({ success: true, message: isLiked ? "Post unliked" : "Post liked" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.postId
        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required" });
        }

        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const post = await postDao.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (!post.user.equals(user._id)) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
        }

        await postDao.deletePost(postId);
        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.savePost = async (req, res) => {
    try {
        const postId =  req.body.postId;
        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required" });
        }

        const user = await userDao.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
      
        const post = await postDao.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const isSaved = user.savedPosts.includes(postId);
        if (isSaved) {
            await userDao.removeSavedPost(user._id, postId);
        } else {
            await userDao.addSavedPost(user._id, postId);
        }

        res.status(200).json({ success: true, message: isSaved ? "Post unsaved" : "Post saved" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const {postId, text} = req.body;

        if(! text)  return res.status(404).json({success : false , message : "comment text is required"})

        if(! postId) return res.status(400).json({ success: false, message: "Post ID is required" });

        const commentpost = await postDao.findByIdWithPopulate(postId, 'user');

        if (!commentpost) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) {
            return res.status(403).json({ success: false, message: "Login user not found" });
        }

        const createdcomment = await commentModel.create({
            text: text,
            user: loginuser._id,
            post: commentpost._id
        });

        commentpost.comments.push(createdcomment._id);
        await commentpost.save();
        await loginuser.save();

        // Fetch the newly created comment with populated user and post fields
        const onecomment = await commentModel.findOne({ _id: createdcomment._id }).populate('user').populate('post');

        // Format the created date for the newly created comment
        let dateObj = new Date(onecomment.createdAt);
        let monthNames = [
            '', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        let day = dateObj.getDate();
        let month = dateObj.getMonth() + 1;
        let year = dateObj.getFullYear();

        let monthName = monthNames[month];
        let formattedDate = `${monthName} ${day}, ${year}`;
        onecomment.formattedDate = formattedDate;
        res.status(200).json({ success: true, onecomment, comments: commentpost.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.viewPostComment = async (req, res) => {
    try {
        
        const loginuser = await userDao.findByEmail(req.user.email);
        if( ! loginuser) return res.status(403).json({success:false, message : "login user not found.."})

        const post = await postDao.findByIdWithPopulate(req.query.postId || req.params.postId, 'comments');
        if(! post) return res.status(403).json({success:false , message : "post not found"})

        const comments = await commentModel.find({ post: post._id }).populate('user')
        if(comments.length == 0 ) return res.status(403).json({success:false, message  : "no comments found for this post."})

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

        res.status(200).json({success:true, loginuser, comments, post });
    } catch (error) {
        res.status(500).json({ success:false, message : error.message })
    }
}

exports.getLikedPosts = async (req, res) => {
    try {
        const postId = req.params.postId;
        if(! postId) return res.status(403).json({success:false, message : "please provdie post Id "})
            const loginuser = await userDao.findByEmail(req.user.email)
           if(! loginuser) return res.status(403).json({success:false, message : "login user is not found"})
        const post = await postDao.findById(postId);
           if(! post) return res.status(403).json({success:false, message : "post is not found"})
        res.status(200).json({success:true,  loginuser, post, totallikes: post.likes.length})
    } catch (error) {
        res.status(500).json({success:false, message : error.message});
    }
}


exports.likedPostUserSearch = async (req, res) => {
    try {
        const { postId, input } = req.query;

        // Validate inputs
        if (!postId || !input) {
            return res.status(400).json({
                success: false,
                message: "Please provide both postId and input",
            });
        }

        // Validate postId format
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID format",
            });
        }

        // Find post with populated likes
        const post = await postDao.findByIdWithPopulate(postId, 'likes');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const regex = new RegExp(input, 'i');

        // Search only users who liked the post and match the input
        const users = await userDao.getTotalUsersWhoLikesPostSearch(regex, post.likes);

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "No users found matching your search.",
            });
        }

        res.status(200).json({
            success: true,
            users,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


exports.likeComment = async (req, res) => {
    try {
        const loginuser = await userDao.findByEmail(req.user.email);
        if (!loginuser) return res.status(403).json({ success: false, message: "login user not found" });

        const commentId = req.body.commentId || req.query.commentId;
        if (!commentId) return res.status(400).json({ success: false, message: "Comment ID is required." });
        const comment = await commentModel.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

        const isLiked = comment.likes.includes(loginuser._id);
        if (isLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== loginuser._id.toString());
        } else {
            comment.likes.push(loginuser._id);
        }

        await comment.save();
        res.status(200).json({ success: true, message: isLiked ? "Comment unliked" : "Comment liked", totalLikes: comment.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getRandomUserPost = async (req, res) => {
  try {
    const openuserId = req.query.openuserId;
    const openpostId = req.query.openpostId;

    if (!openuserId || !openpostId) {
      return res.status(400).json({
        success: false,
        message: "openUser ID and openPost ID are required."
      });
    }

    const loginuser = await userDao.findByEmail(req.user.email);
    if (!loginuser) {
      return res.status(403).json({ success: false, message: "Login user not found" });
    }

    const openUser = await userDao.findById(openuserId);
    if (!openUser) {
      return res.status(403).json({ success: false, message: "Open user not found" });
    }

    const openPost = await postDao.findByIdWithPopulate(openpostId, 'user');
    if (!openPost) {
      return res.status(403).json({ message: "Open post not found!" });
    }

    // Exclude login user and open user from random selection
    const excludeUserIds = [loginuser._id, openUser._id];
    const randomPosts = await postDao.getRandomPosts(10, excludeUserIds); // you can adjust limit as needed

    const filteredRandomPosts = randomPosts.filter(post => post.user);

    const posts = [openPost, ...filteredRandomPosts];
    if (posts.length === 0) {
      return res.status(403).json({ success: false, message: "Could not find posts" });
    }

    res.status(200).json({ posts, loginuser, openUser });
  } catch (error) {
    console.error("Error in getRandomUserPost:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoginUserPost = async (req, res) => {
  try {
    const openpostId = req.params.postId;
    if (!openpostId) {
      return res.status(403).json({ success: false, message: "Please provide post ID" });
    }

    const loginuser = await userDao.findByEmail(req.user.email);
    if (!loginuser) {
      return res.status(403).json({ success: false, message: "Login user not found" });
    }

    const openPost = await postDao.findByIdWithComments(openpostId);
    if (!openPost) {
      return res.status(403).json({ message: "Post not found!" });
    }

    const userPosts = await postDao.findUserPostsExcludingPost(loginuser._id, openPost._id);

    let insertIndex = 0;
    for (let i = 0; i < userPosts.length; i++) {
      if (userPosts[i].createdAt < openPost.createdAt) {
        insertIndex = i;
        break;
      }
    }

    const posts = [...userPosts];
    posts.splice(insertIndex, 0, openPost);

    const limitedPosts = posts.slice(0, 20);

    res.json({
      posts: limitedPosts,
      openPost,
      loginuser,
      dater: utils.formatRelativeTime
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.toggleCommentsOnPost = async (req, res) => {
    try {
        const { postId } = req.body;
        if(! postId) return res.status(403).json({success:false, message : "Please provide postId"})

        const post = await postDao.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        post.commentsEnabled = !post.commentsEnabled;
        const updatedPost = await post.save();
        res.status(200).json({ success: true, updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.toggleLikesOnPost = async (req, res) => {
      try {
           const {postId} = req.body;
           if(! postId) return res.status(403).json({success:false, message : "Please provide Postid"})

        const post = await postDao.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        post.hidelikes = !post.hidelikes;
        const updatedPost = await post.save();
        res.status(200).json({ success: true, message:"Toggle Post likes successfully",updatedPost });
      } catch (error) {
         console.error(error)
      }
}

exports.togglePinnedOnPost = async (req, res) => {
    try {
        const loginUser = await userDao.findByEmail(req.user.email)
        if (!loginUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const {postId} = req.body;
        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required." });
        }

        const post = await postDao.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found." });
        }
         
        const postIndex = loginUser.posts.findIndex(p => p._id.toString() === postId);
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found in user\'s posts.' });
        }

        if (post.pinned) {
            post.pinned = false;
            const removedPost = loginUser.posts.splice(postIndex, 1)[0];
            const insertIndex = post.originalIndex >= 0 && post.originalIndex < loginUser.posts.length ? post.originalIndex : loginUser.posts.length;
            loginUser.posts.splice(insertIndex, 0, removedPost);
            post.originalIndex = -1;
        } else {
            post.pinned = true;
            post.originalIndex = postIndex;
            const removedPost = loginUser.posts.splice(postIndex, 1)[0];
            loginUser.posts.unshift(removedPost);
        }

        await post.save();
        await loginUser.save();
        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getEditPost = async (req, res) => {
    try {
        const post = await postDao.findByIdWithPopulate(req.params.postId || req.query.postId, 'user');
        
        if (!post) return res.status(403).json({ message: "Post not found" })

        const loginuser = await userDao.findByEmail(req.user.email)
       if(! loginuser) return res.status(403).json({success:false, message : "user not found"})

        let dateObj = new Date(post.createdAt);
        let monthNames = [
            '', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        let day = dateObj.getDate();
        let month = dateObj.getMonth() + 1;
        let year = dateObj.getFullYear();

        let monthName = monthNames[month];
        let formattedDate = `${monthName} ${day}, ${year}`;
        post.formattedDate = formattedDate;

        res.status(200).json({success:true, post, loginuser});
    } catch (error) {
        res.status(500).json({success:false, message : error.message })
    }
}

exports.editPost = async (req, res) => {
    try {
        const { caption, postId} = req.body;
        if (!caption || caption.trim() === "") {
            return res.status(400).json({ success:false, message: 'Caption cannot be empty' });
        }
        const postid =  postId;
        if(! postid) return res.status(403).json({success:false, message : "please provide post id for edit the post"})

        const post = await postDao.updatePost(postid, { caption });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({success:true, message : "post edited successfully", post})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


