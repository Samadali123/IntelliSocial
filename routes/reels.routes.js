const express = require("express");
const { authentication } = require("../middlewares/auth.middleware");
const { getAllReels, getReelById, getReelsByUser, deleteReel, uploadReel, updateReel,} = require("../controllers/reels.controller");
const   {createVideoUpload} = require("../middlewares/gridfs.middleware")
const router = express.Router();
require("dotenv").config();


const videoUpload = createVideoUpload();

router.post('/upload', [ authentication, videoUpload.single('video')], uploadReel);

// Get all reels
// /reels/all
router.get("/all", authentication, getAllReels);

// Get a single reel by ID
// /reels/reel/:id
router.get("/reel/:id", authentication, getReelById);

// Get all reels for a specific user
// /reels/reel/user/:userId
router.get("/reel/user/:userId", authentication, getReelsByUser);

// Delete a reel
// /reels/reel/delete/:id
router.delete("/reel/delete/:id", authentication, deleteReel);

// Update a reel
// /reels/reel/update/:id
router.put("/reel/update/:id", authentication, updateReel);



module.exports = router;
