const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {blockUser,  unblockUser, getLoginUserSavedPosts, getOpenUserPosts, getArchieveStory, getLoginuserLikedPosts, getLoginuserCommentsOnPosts, getpostCommentsonPost, getOpenuserLikedonPost, getLoginuserPosts, getSinglePost, getLoginuserHighlights, getSingleHighlight, removeLoginuserContent, getAboutofLoginuser, loginuserAccountToggle, resetPasswordofLoginuser, getBlockedAccounts } = require("../controllers/settings.controllers");


// /settings/saved/posts
router.get("/saved/posts", authentication,   getLoginUserSavedPosts)


// /settings/saved/posts/open/:openpost/:openuser
router.get("/saved/posts/open/:openpost/:openuser", authentication, getOpenUserPosts);



// /settings/archieve/story/:id
router.get(`/archieve/story/:id`, authentication,  getArchieveStory)



// /settings/user/likes
router.get("/user/likes", authentication,  getLoginuserLikedPosts);


// /settings/user/comments
router.get("/user/comments", authentication, getLoginuserCommentsOnPosts);


// /settings/user/posts/comments/:postId
router.get('/user/posts/comments/:postId', authentication,  getpostCommentsonPost);


// /settings/liked.posts/:postId/:userId
router.get("/liked/posts/:postid/:userid", authentication,  getOpenuserLikedonPost)



// /settings/user/posts
router.get("/user/posts", authentication,  getLoginuserPosts)


// /settings/user/posts/open/:postid
router.get("/user/posts/open/:postid", authentication,  getSinglePost)


// /settings/user/highlights
router.get("/user/highlights", authentication,  getLoginuserHighlights)


// /settings/user/highlights/:highlightId/:number
router.get("/user/highlights/:highlightId/:number", authentication,  getSingleHighlight);


// /settings/user/highlights
router.get("/user/highlights", authentication, getLoginuserHighlights)



// /settings/content/removed
router.get('/content/removed', authentication , removeLoginuserContent);



// /settings/aboutus
router.get("/aboutus", authentication,  getAboutofLoginuser);



// /settings/account/toggle
router.get("/account/toggle", authentication, loginuserAccountToggle);


// /settings/resetpassword
router.put("/resetpassword", authentication, resetPasswordofLoginuser)



// /settings/block/user
router.put("/block/user", authentication,  blockUser);


// /settings/blocked/accounts
router.get("/blocked/accounts", authentication,  getBlockedAccounts)


// /settings/unblock/user
router.put('/unblock/user', authentication,  unblockUser);




module.exports = router;