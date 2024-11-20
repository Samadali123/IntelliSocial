const userModel = require("../models/user.model")
const postModel = require("../models/post.model")
const commentModel = require("../models/comments.model")
const utils = require("../utils/date.utils")



exports.uploadPost = async (req, res) => {
    try {

        if (!req.body.caption || !req.file) {
            return res.status(400).json({ success: false, message: "Caption is required and image must be selected" });
        }

        if (!req.body.caption) {
            return res.status(400).json({ success: false, message: "Caption is required for a post" });
        }

        // Get Cloudinary image URLs
        if (!req.files) {
            return res.status(400).json({ success: false, message: "please provide images" })
        }
        const images = req.files.map(file => file.path);

        const loginuser = await userModel.findOne({ email: req.user.email });
        if(! loginuser) return res.status(403).json({success:false , message : "login user not found"})

        const createdpost = await postModel.create({
            caption: req.body.caption,
            image: images,
            user: loginuser._id,
        })

        loginuser.posts.push(createdpost);
        await loginuser.save();
        res.status(200).json({success:false, message : "posts uploaded successfully", createdpost, loginuser})
    } catch (error) {
        res.status(500).json({ success:false, message:error.message })

    }
}

exports.likePost = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email })
        if(! loginuser) return res.status(403).json({success:false , message : "login user not found"})

        const post = await postModel.findById({ _id: req.body.postId  || req.query.postId}).populate(`user`);
        if(! post) return res.status(403).json({success:false , message : "postnot found"})

        if (post.likes.indexOf(loginuser._id) === -1) {
            post.likes.push(loginuser._id);

        } else {
            post.likes.splice(post.likes.indexOf(loginuser._id), 1);

        }

        await post.save();
        await loginuser.save();
        res.json(200).json({success:true, loginuser, post})
    } catch (error) {
        res.status(500).json({success:false, message : error.message})
    }
}

exports.savePost = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if(! user) return res.status(403).json({success:false , message : "login user not found"})

        const post = await postModel.findById({ _id: req.body.postId || req.query.postId });
        if(! post) return res.status(403).json({success:false , message : "post not found"})

        if (user.savedPosts.indexOf(post._id) === -1) {
            user.savedPosts.push(post._id);

        } else {
            user.savedPosts.splice(user.savedPosts.indexOf(post._id), 1);
        }


        if (post.savedBy.indexOf(user._id) === -1) {
            post.savedBy.push(user._id);
        } else {
            post.savedBy.splice(post.savedBy.indexOf(user._id), 1);
        }

        await user.save();
        await post.save();

        res.status(200).json({success:true, post, loginuser});
    } catch (error) {
        res.status(500).json({ success:false, message : error.message })
    }
}


exports.addComment = async (req, res) => {
    try {
        const commentpost = await postModel.findOne({ _id: req.params.postid || req.query.postid });
        if(! commentpost) return res.status(403).json({success:false , message : "comment post not found"})

        const loginuser = await userModel.findOne({ email: req.user.email });
        if(! loginuser) return res.status(403).json({success:false , message : "login user not found"})

        const createdcomment = await commentModel.create({
            text: req.body.text,
            user: loginuser._id,
            post: commentpost._id
        });

        commentpost.comments.push(createdcomment._id);
        loginuser.commentPost.push(commentpost._id);
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
        res.status(200).json({success:true, loginuser, onecomment})
    } catch (error) {
        res.status(500).json({success:false, message : error.message})
    }
}


exports.viewPostComment = async (req, res) => {
    try {
        
        const loginuser = await userModel.findOne({ email: req.user.email });
        if( ! loginuser) return res.status(403).json({success:false, message : "login user not found.."})

        const post = await postModel.findById(req.params.postId);
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
        // const post = await postModel.findById({ _id: req.params.postId }).populate(`likes`).populate(`user`, 'stories');
        const postId = req.query.id || req.params.id;
        if(! postId) return res.status(403).json({success:false, message : "please provdie post Id "})
            const loginuser = await userModel.findOne({ email: req.user.email })
           if(! loginuser) return res.status(403).json({success:false, message : "login user is not found"})
        const post = await postModel.findById(postId)
            .populate('likes')
            .populate({
                path: 'user',
                select: '_id stories' // _id is always included by default, so this will include _id and stories
            });

        res.status(200).json({success:true,  loginuser, post,})
    } catch (error) {
        res.status(500).json({success:false, message : error.message});
    }
}


exports.likedPostUserSearch = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.postId || req.query.postId);
        if(! post) return res.status(403).json({success:false, message: "post not found"});

        await post.populate('likes');
        const input = req.params.input || req.query.input;
        if(! input) return res.status(403).json({success:false, message : "please provide input for search "})
        const regex = new RegExp(`^${input}`, 'i');
        const users = post.likes.filter(like => regex.test(like.username));
         if(users.length == 0 )  return res.status(403).json({success:false, message : "users not found who liked this post."})
        res.status(200).json({success:true, loginuser,users});
    } catch (error) {
       res.status(500).json({ success:false, message : error.message})
    }
}

exports.likeComment = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });
        if (!loginuser) return res.status(403).json({ success: false, message: "login user not found" });

        const commentId = req.body.commentID || req.query.commentID;
        if (!commentId) return res.status(400).json({ success: false, message: "Comment ID is required." });
        const comment = await commentModel.findOne({ _id: commentId });
        
        const length = comment.likes.length;

        if (comment.likes.indexOf(loginuser._id) === -1) {
            comment.likes.push(loginuser._id);
        } else {
            comment.likes.splice(comment.likes.indexOf(loginuser._id), 1);
        }

        await loginuser.save();
        await comment.save();
        res.status(200).json({ success: true, length });
    } catch (error) {
        res.status(500).json({ success: false, message : error.message });
    }
}


exports.getRandomUserPost = async (req, res) => {
    try {
        // Fetch the logged-in user and open user details
        const loginuser = await userModel.findOne({ email: req.user.email })
            .populate("followers")
            .populate("following")
            .populate("blockedUsers");  // Ensure blockedUsers is populated

            if (!loginuser) return res.status(403).json({ success: false, message: "login user not found" });

        const openUser = await userModel.findById(req.params.openuser || req.query.openuser)
            .populate("followers")
            .populate("following");


            if (! openUser) return res.status(403).json({ success: false, message: "openUser not found" });


        // Find the specific open post and populate its user
        const openPost = await postModel.findById(req.params.openpost).populate("user");
        if (!openPost) return res.status(403).json({ message: "openPost not found!" });

        // Find random posts excluding blocked users and users with private accounts
        const count = await postModel.countDocuments({
            user: { $nin: loginuser.blockedUsers },  // Exclude blocked users
        });

        const randomIndex = Math.floor(Math.random() * count);

        const randomPosts = await postModel.find({
            user: { $nin: loginuser.blockedUsers }  // Exclude blocked users
        })
            .skip(randomIndex)
            .limit(19)
            .populate({
                path: "user",
                match: { privateAccount: false }  // Only include users whose privateAccount is false
            });

        // Filter out posts where the user is null (due to match excluding some users)
        const filteredRandomPosts = randomPosts.filter(post => post.user);

        // Combine the openPost with the filtered random posts
        let posts = [openPost, ...filteredRandomPosts];
        if( posts.length == 0)  return res.status(403).json({success:false, message : "could not find posts"})

        // Respond with JSON containing posts, loginuser, and openUser
        res.status(200).json({ posts, loginuser, openUser });

    } catch (error) {
        res.status(500).json({ success:false, message : error.message });
    }
}


exports.getLoginUserPost = async (req, res) => {
    try {
        const loginuser = await userModel.findOne({ email: req.user.email });

        if (!loginuser) return res.status(403).json({ success: false, message: "login user not found" });


        // const openPost = await postModel.findById(req.params.openpost).populate("user").populate("comments");
        const openPost = await postModel.findById(req.params.openpostid || req.query.openpostid)
            .populate("user")
            .populate({
                path: 'comments',
                select: '_id text',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            });


        if (!openPost) return res.status(403).json({ message: "Post not found!" });


        const userPosts = await postModel.find({ user: loginuser._id, _id: { $ne: openPost._id } }).sort({ createdAt: -1 }).populate("user").populate({
            path: 'comments',
            select: '_id text',
            populate: {
                path: 'user',
                select: 'username'
            }
        });

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
        res.status(500).json({success:false, message : error.message })
    }
}


exports.toggleCommentsOnPost = async (req, res) => {
    try {
        const postId = req.query.id || req.body.id;
        if(! postId) return res.status(403).json({success:false, message : "Please provide postId"})

        const post = await postModel.findById(postId);
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

        const postId = req.query.id || req.body.id;
        if(! postId) return res.status(403).json({success:false, message : "Please provide postId"})

        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        post.hidelikes = !post.hidelikes;
        const updatedPost = await post.save();
        res.status(200).json({ success: true, updatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.togglePinnedOnPost = async (req, res) => {
    try {
        const loginUser = await userModel.findOne({ email: req.user.email }).populate('posts');
        if (!loginUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const postId = req.query.id || req.body.id;
        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required." });
        }

        const post = await postModel.findById(postId);
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
        const post = await postModel.findById(req.params.id || req.query.id).populate("user")
        if (!post) return res.status(403).json({ message: "Post not found" })

        const loginuser = await userModel.findOne({ email: req.user.email })
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
        const { caption, id } = req.body;
        if (!caption || caption.trim() === "") {
            return res.status(400).json({ success:false, message: 'Caption cannot be empty' });
        }
        const postid = req.query.id || id;
        if(! postid) return res.status(403).json({success:false, message : "please provide post id for edit the post"})

        const post = await postModel.findOneAndUpdate({ _id: req.params.id }, { $set: { caption } }, { new: true });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({success:true, message : "post edited successfully", post})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.deletePost = async (req, res) => {
    try {
        const postid = req.query.id || req.body.id;
        if(! postid) return res.status(403).json({success:false, message : "please provide post id for delete the post"})

        const post = await postModel.findByIdAndDelete(postid)
        if (!post) return res.status(403).json({ message: "Post not found !" });
        const loginuser = await userModel.findOne({ email: req.user.email })
        loginuser.deletedContent.push(post);
        await loginuser.save(); 
        res.status(200).json({success:true, message : "Post Deleted successfully", post})
    } catch (error) {
        res.status(500).json({ success:false, message:error.message })
    }
}


