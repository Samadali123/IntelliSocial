const express = require('express');
const router = express.Router();
const upload = require("../middlewares/images.middleware")
const {authentication} = require("../middlewares/auth.middleware");
const { createPost, likePost, savePost, addComment, viewPostComment, getLikedPosts, likedPostUserSearch, likeComment, getRandomUserPost, getLoginUserPost, toggleCommentsOnPost, toggleLikesOnPost, togglePinnedOnPost, getEditPost, editPost, deletePost } = require('../controllers/post.controllers');

// /posts/uploads/post
router.post("/upload/post", [authentication, upload.array('image', 5),] , createPost)

// //posts/like/post
router.put("/like/post", authentication, likePost)

// //posts/save
router.put("/save", authentication , savePost)

// /posts/comment
router.post("/comment", authentication, addComment)

// /posts/view/comments
router.get("/view/comments", authentication, viewPostComment)

// /posts/post/likes
router.get("/post/likes/:postId", authentication, getLikedPosts )

// /post/likes/users   // check working in testing also
router.get("/post/likes/users", authentication, likedPostUserSearch)

// /posts/comment/like
router.put("/comment/like", authentication, likeComment)

// /posts/open
router.get("/open", authentication, getRandomUserPost)

// /posts/myposts/open
router.get("/myposts/open/:postId", authentication, getLoginUserPost)

// /posts/comments/toggle
router.put("/comments/toggle", authentication,  toggleCommentsOnPost)

// /posts/toggle/likes
router.put("/likes/toggle",  authentication,   toggleLikesOnPost);

// /posts/pin/toggle

router.put("/pin/toggle", authentication, togglePinnedOnPost)

// /posts/edit
router.get("/edit", authentication, getEditPost)

// //posts/edit
router.put("/edit", authentication, editPost)

// /posts/delete
router.delete("/delete/:postId", authentication, deletePost)





module.exports = router;