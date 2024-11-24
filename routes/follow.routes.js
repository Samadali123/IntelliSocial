const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {  FollowAndUnfollow,removeLoginuserFollower, searchUserFollowers, searchUserFollowings, getFollowers, getFollowings, getLoginuserFollowers, getLoginuserFollowings } = require('../controllers/follow.controllers');

// /follows/follow
router.put(`/follow`, authentication, FollowAndUnfollow )

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

// /follows/search/followers
router.get(`/search/followers`, authentication, searchUserFollowers);

// /follows/search/following
router.get(`/search/following`, authentication, searchUserFollowings);


module.exports = router;