const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {  searchUsers,getFeeds, getOpenuserProfile } = require('../controllers/feed.controllers');


// /feed/home
router.get("/home", authentication,  getFeeds)

// /feed/users
router.get("/users", authentication, searchUsers)

// /feed/openprofile
router.get("/openprofile", authentication, getOpenuserProfile)





module.exports = router;