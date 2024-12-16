const express = require("express");
const { authentication } = require("../middlewares/auth.middleware");
const { uploadReelToCloudinary, getAllReels, getReelById, getReelsByUser, deleteReel, updateReel } = require("../controllers/reels.controller");
const { uploadFile } = require("../middlewares/upload.middleware");
// const upload = require("../middlewares/gridfs.middleware");
const router = express.Router();



// POST route for uploading a reel to Cloudinary
// /reels/upload
// router.post('/upload',  [authentication, upload.single("reel")],  uploadReelToCloudinary);
router.post("/upload",   [authentication, uploadFile ],  uploadReelToCloudinary)

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
