const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const {getStoriesForHighlights, getStoriesIdsForHighlights, addHighlights, getHighlights } = require('../controllers/highlights.controllers');


// //highlights/getstories
router.get("/getstories", authentication,  getStoriesForHighlights)


// /highlights/add/highlights/cover:Ids
router.get("/add/highlights/cover/:Ids", authentication,  getStoriesIdsForHighlights);


// /highlights/upload/highlight
router.post("/upload/highlight", authentication,  addHighlights);


///highlights/gethighlights
router.get("/gethighlights", authentication, getHighlights );



module.exports = router;
