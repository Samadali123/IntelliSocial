const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware")
const upload = require("../middlewares/images.middleware");
const { addStory, likeStory, deleteStory, getStories, getSingleStory } = require('../controllers/story.controllers');



// /stories/:username/add/story
router.post(`/:username/add/story`, [authentication,upload.single(`storyimage`)],  addStory )

//  /stories/:userID
router.get("/getstories/:userID", authentication,  getStories)

//  /stories/:storyId
router.get("/getstories/:storyId", authentication,  getSingleStory)

// /stories/story/:like/:storyId
router.put("/story/like/:StoryId", authentication,  likeStory);

// /stories/story/delete/:storyId
router.delete("/story/delete/:StoryId", authentication,deleteStory);




module.exports = router;