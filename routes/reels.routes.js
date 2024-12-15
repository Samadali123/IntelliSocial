const express = require("express");
const { authentication } = require("../middlewares/auth.middleware");
const { uploadVideo} = require("../middlewares/reels.middleware");
const { uploadReelWithThumbnail, getAllReels, getReelById, getReelsByUser, deleteReel, updateReel } = require("../controllers/reels.controllers");
const router = express.Router();

// Upload a reel with video and thumbnail
// /reels/upload
router.post("/upload",
    authentication,
    uploadVideo.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    uploadReelWithThumbnail
);

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
