const express = require('express');
const router = express.Router();
const upload = require("../middlewares/images.middleware")
const {authentication} = require("../middlewares/auth.middleware");
const { uploadPost, likePost, savePost, addComment, viewPostComment,  likedPostUserSearch, likeComment, editPost, deletePost, getLikedPosts, getRandomUserPost, getLoginUserPost, toggleCommentsOnPost, toggleLikesOnPost, togglePinnedOnPost, getEditPost } = require('../controllers/post.controllers');




// /posts/uploads/post
router.post("/upload/post", [authentication, upload.array('image', 5),] ,uploadPost)

// //posts/like/post
router.put("/like/post", authentication, likePost)

// //posts/save
router.put("/save/:postId", authentication, savePost)

// /posts/comment/:data/:postid
router.post("/comment/:data/:postid", authentication, addComment)

// /posts/view/comments/:postid
router.get("/view/comments/:postId'", authentication, viewPostComment)

// /posts/post/likes/:postid
router.get("/post/likes/:postId", authentication, getLikedPosts )


// /post/likes/users/:postId/:input
router.get("/post/likes/users/:postId/:input", authentication, likedPostUserSearch)

// /posts/comment/like/:commentID
router.put("/comment/like/:commentID", authentication, likeComment)

// /posts/open/:openpost/:openuser
router.get("/open/:openpost/:openuser", authentication, getRandomUserPost)

// /posts/myposts/open/:openpost
router.get("/myposts/open/:openpost", authentication, getLoginUserPost)

// /comments/toggle
router.put("/comments/toggle", authentication,  toggleCommentsOnPost)

// /posts/likes/toggle
router.put("/likes/toggle'", authentication, toggleLikesOnPost)

// /posts/pin/toggle
router.put("/pin/toggle", authentication, togglePinnedOnPost)

// /posts/edit/:id
router.get("/edit/:id", authentication, getEditPost)

// //posts/edit
router.put("/edit", authentication, editPost)

// /posts/delete
router.delete("/delete", authentication, deletePost)





module.exports = router;