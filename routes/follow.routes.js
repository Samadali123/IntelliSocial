const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {  FollowAndUnfollow,removeLoginuserFollower, searchUserFollowers, searchUserFollowings, getFollowers, getFollowings, getLoginuserFollowers, getLoginuserFollowings } = require('../controllers/follow.controllers');


// /follows/followers
router.get('/followers/:userId', authentication, getFollowers);

// /follows/followings
router.get('/followings/:userId', authentication, getFollowings);

// /follows/myfollowers
router.get('/myfollowers', authentication, getLoginuserFollowers);

// /follows/myfollowing
router.get('/myfollowing', authentication, getLoginuserFollowings);

// /follows/follow
router.put(`/follow`, authentication, FollowAndUnfollow )

// /follows/myfollowers/remove
router.delete("/myfollowers/remove", authentication, removeLoginuserFollower)

// /follows/search/followers
router.get(`/search/followers`, authentication, searchUserFollowers);

// /follows/search/following
router.get(`/search/following`, authentication, searchUserFollowings);


module.exports = router;