
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
require('dotenv').config({ path: './.env' });
const path = require('path');
const { connectDB } = require('./config/db.config');
const usersRoutes = require("./routes/user.routes")
const profileRoutes = require("./routes/profile.routes")
const userFeedRoutes = require("./routes/feed.routes")
const postRoutes = require("./routes/post.routes")
const followRoutes = require("./routes/follow.routes")
const notesRoutes = require("./routes/notes.routes")
const storyRoutes = require("./routes/story.routes")
const highlightsRoutes = require("./routes/highlights.routes")
const settingsRoutes = require("./routes/settings.routes")



// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Configure session
app.use(session({
    secret: process.env.GOOGLE_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }, // 2 hours
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        autoRemove: 'disabled',
    }),
}));

// Initialize flash messages
app.use(flash());

// Initialize Passport for session handling
app.use(passport.authenticate('session'));
passport.serializeUser((user, cb) => cb(null, { id: user.id, username: user.username, name: user.name }));
passport.deserializeUser((user, cb) => process.nextTick(() => cb(null, user)));
// cookier parsers
app.use(cookieParser()); // Parse cookies


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


// Middleware setup
app.use(logger("tiny"));  // HTTP request logging
app.use(express.json()); // JSON body parsing
app.use(express.urlencoded({ extended: false })); // URL-encoded body parsing


// User routes
app.use("/users", usersRoutes);

// Profile routes
app.use("/profile", profileRoutes);

// Post routes
app.use("/posts", postRoutes);

// Notes routes
app.use("/notes", notesRoutes);

// Follow routes
app.use("/follows", followRoutes);

// Story routes
app.use("/stories", storyRoutes);

// User feed routes
app.use("/feed", userFeedRoutes);

// Highlights routes
app.use("/highlights", highlightsRoutes);

// Settings routes
app.use("/settings", settingsRoutes);



// Handle unknown routes seamlessly
app.all("*", (req, res)=>{res.status(404).json({success:false, message : `${req.url} not found`})})


// Export the app for use in server.js
module.exports = app;
