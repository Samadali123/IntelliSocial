const express = require('express');
const { authentication } = require('../middlewares/auth.middleware');
const router = express.Router();
const upload = require("../middlewares/images.middleware");
const {getLoginuserProfile, uploadProfile, editProfile} = require("../controllers/profile.controllers")



// /profile/loginuser
router.get("/loginuser", authentication ,getLoginuserProfile)

// /profile/uploadprofile
router.post("/uploadprofile", [authentication, upload.single("profile")], uploadProfile)

// /profile/edit/profile
router.post("/edit/profile", authentication,  editProfile)






module.exports = router;