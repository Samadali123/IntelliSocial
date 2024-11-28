const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {getStoriesForHighlights, getHighlights, addHighlightsCover, uploadHighlight } = require('../controllers/highlights.controllers');
const upload = require('../middlewares/images.middleware');


// //highlights/getstories
router.get("/getstories", authentication,  getStoriesForHighlights)


// /highlights/add/cover
router.put("/add/cover",  authentication,   addHighlightsCover);


// /highlights/upload
router.post("/upload",  [authentication, upload.single("coverimage")] , uploadHighlight );


///highlights/gethighlights
router.get("/gethighlights", authentication, getHighlights );



module.exports = router;



