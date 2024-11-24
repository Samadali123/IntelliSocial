const express = require('express');
const router = express.Router();
const upload = require("../middlewares/images.middleware")
const {authentication} = require("../middlewares/auth.middleware");
const { uploadPost, likePost, savePost, addComment, viewPostComment,  likedPostUserSearch, likeComment, editPost, deletePost, getLikedPosts, getRandomUserPost, getLoginUserPost, toggleCommentsOnPost,togglePinnedOnPost, getEditPost, toggleLikesOnPost } = require('../controllers/post.controllers');




// /posts/uploads/post
router.post("/upload/post", [authentication, upload.array('image', 5),] ,uploadPost)

// //posts/like/post
router.put("/like/post", authentication, likePost)

// //posts/save
router.put("/save", authentication , savePost)

// /posts/comment
router.post("/comment", authentication, addComment)

// /posts/view/comments
router.get("/view/comments", authentication, viewPostComment)

// /posts/post/likes
router.get("/post/likes", authentication, getLikedPosts )

// /post/likes/users
router.get("/post/likes/users", authentication, likedPostUserSearch)

// /posts/comment/like
router.put("/comment/like", authentication, likeComment)

// /posts/open
router.get("/open", authentication, getRandomUserPost)

// /posts/myposts/open
router.get("/myposts/open", authentication, getLoginUserPost)

// /posts/comments/toggle
router.put("/comments/toggle", authentication,  toggleCommentsOnPost)

// /posts/likes/toggle
router.put("/likes/toggle'", authentication, toggleLikesOnPost)

// /posts/pin/toggle
router.put("/pin/toggle", authentication, togglePinnedOnPost)

// /posts/edit
router.get("/edit", authentication, getEditPost)

// //posts/edit
router.put("/edit", authentication, editPost)

// /posts/delete
router.delete("/delete", authentication, deletePost)





module.exports = router;