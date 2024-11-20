const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {  searchUsers,getFeeds, getOpenuserProfile } = require('../controllers/feed.controllers');


// /feed/home
router.get("/home", authentication,  getFeeds)


// /feed/users/:input
router.get("/users/:input", authentication, searchUsers)

// /feed/openprofile/:username
router.get("/openprofile/:username", authentication, getOpenuserProfile)





module.exports = router;