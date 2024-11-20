const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {  followAndUnfollow,  removeLoginuserFollower, searchUserFollowers, searchUserFollowings, getFollowers, getFollowings, getLoginuserFollowers, getLoginuserFollowings } = require('../controllers/follow.controllers');

// /follows/follow/:followeruser
router.put(`/follow/:followeruser`, authentication, followAndUnfollow)

// /follows/followers/:userid
router.get('/followers/:userId', authentication, getFollowers);

// /follows/followings/:userid
router.get('/followings/:userId', authentication, getFollowings);

// /follows/myfollowers
router.get('/myfollowers', authentication, getLoginuserFollowers);

// /follows/myfollowing
router.get('/myfollowing', authentication, getLoginuserFollowings);

// /follows/myfollowers/remove
router.delete("/myfollowers/remove", authentication, removeLoginuserFollower)

// /follows/search/:openuser/followers/:input
router.get(`/search/:openuser/followers/:input`, authentication, searchUserFollowers);

// /follows/search/:openuser/following/:input
router.get(`/search/:openuser/following/:input`, authentication, searchUserFollowings);




module.exports = router;