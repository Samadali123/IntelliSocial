const express = require('express');
const router = express.Router();
const {authentication} = require("../middlewares/auth.middleware");
const { createNote, deleteNote } = require('../controllers/notes.controllers');


// /notes/createnote
router.post("/createnote", authentication, createNote)

// /notes/deletenote
router.put("/deletenote", authentication, deleteNote )



module.exports = router;