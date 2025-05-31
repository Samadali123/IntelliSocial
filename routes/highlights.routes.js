const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const upload = require('../middlewares/images.middleware');
const {getStoriesForHighlights, addHighlightsCover, createHighlight , getHighlights, getSingleHighlight , deleteHighlight,  getHighlightsOfLoginuser} = require("../controllers/highlights.controllers")

// //highlights/getstories
router.get("/getstories", authentication,  getStoriesForHighlights)


// /highlights/add/cover
router.put("/add/cover",  authentication,   addHighlightsCover);


// /highlights/upload
router.post("/upload",  [authentication, upload.single("coverimage")] , createHighlight);


///highlights/gethighlights
router.get("/gethighlights", authentication, getHighlights );

// /highlights/gethighlights/loginuser
router.get("/gethighlights/loginuser", authentication, getHighlightsOfLoginuser);

// /highlights/gethighlights/:id
router.get("/gethighlights/:id", authentication, getSingleHighlight);

// /highlights/delete/:id
router.delete("/delete/:id", authentication, deleteHighlight);

module.exports = router;



