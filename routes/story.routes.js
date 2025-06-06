const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware")
const upload = require("../middlewares/images.middleware");
const { addStory, getStories, getSingleStory, likeStory, deleteStory } = require('../controllers/story.controllers');



// /stories/add/story
router.post(`/add/story`, [authentication,upload.single(`storyimage`)],  addStory )

//  /get/stories
router.get("/get/stories", authentication,  getStories)

//  /get/story
router.get("/get/story/:id", authentication,  getSingleStory)

// /stories/story/like
router.put("/story/like", authentication,  likeStory);

// /stories/story/delete
router.delete("/story/delete/:storyId", authentication,deleteStory);




module.exports = router;