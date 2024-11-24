const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {  followAndUnfollow,  removeLoginuserFollower, searchUserFollowers, searchUserFollowings, getFollowers, getFollowings, getLoginuserFollowers, getLoginuserFollowings } = require('../controllers/follow.controllers');

// /follows/follow
router.put(`/follow`, authentication, followAndUnfollow)

// /follows/followers
router.get('/followers', authentication, getFollowers);

// /follows/followings
router.get('/followings', authentication, getFollowings);

// /follows/myfollowers
router.get('/myfollowers', authentication, getLoginuserFollowers);

// /follows/myfollowing
router.get('/myfollowing', authentication, getLoginuserFollowings);

// /follows/myfollowers/remove
router.delete("/myfollowers/remove", authentication, removeLoginuserFollower)

// /follows/search/:openuser/followers
router.get(`/search/:openuser/followers`, authentication, searchUserFollowers);

// /follows/search/:openuser/following
router.get(`/search/:openuser/following`, authentication, searchUserFollowings);




module.exports = router;