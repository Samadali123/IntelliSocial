const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {getSavedPosts, getUserHighlights, getLikedPosts, getUserPosts, getSingleHighlight, getArchiveStory, getSinglePost ,getOpenUserPosts, OpenUserLikedPost, removeUserContent, getLoginuserCommentsOnPosts, getpostCommentsonPost,getAboutofLoginuser, loginuserAccountToggle, resetPasswordofLoginuser, blockUser, getBlockedAccounts, unblockUser, getOpenUserLikedPosts }  = require("../controllers/settings.controllers")


// /settings/saved/posts
router.get("/saved/posts", authentication, getSavedPosts )


// /settings/saved/posts/open
router.get("/saved/posts/open/:userId", authentication, getOpenUserPosts);


// /settings/archieve/story
router.get(`/archieve/story/:storyId`, authentication,  getArchiveStory)

// /settings/user/likes
router.get("/user/likes", authentication,  getLikedPosts);


// /settings/user/comments
router.get("/user/comments", authentication, getLoginuserCommentsOnPosts);


// /settings/user/posts/comments
router.get('/user/posts/comments/:postId', authentication,  getpostCommentsonPost);


// /settings/liked/posts
router.get("/liked/posts", authentication,  getOpenUserLikedPosts)


// /settings/user/posts
router.get("/user/posts", authentication,  getUserPosts)


// /settings/user/posts/open
router.get("/user/posts/open/:postId", authentication,  getSinglePost)


// /settings/user/highlights
router.get("/user/highlights", authentication,  getUserHighlights)


// /settings/user/singlehighlight
router.get("/user/singlehighlight/:highlightId", authentication,  getSingleHighlight);


//***** */
// /settings/content/removed
router.delete('/content/removed', authentication , removeUserContent);


// /settings/aboutus
router.get("/aboutus", authentication,  getAboutofLoginuser);


// /settings/account/toggle
router.put("/account/toggle", authentication, loginuserAccountToggle);


//***** */
// /settings/resetpassword
router.put("/resetpassword", authentication, resetPasswordofLoginuser)


// /settings/block/user
router.put("/block/user", authentication,  blockUser);


// /settings/blocked/accounts
router.get("/blocked/accounts", authentication,  getBlockedAccounts)


// /settings/unblock/user
router.put('/unblock/user', authentication,  unblockUser);




module.exports = router;