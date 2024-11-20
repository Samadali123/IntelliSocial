// multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config');

// Configure video storage on Cloudinary
const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'public/uploads/reels',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        transformation: [{
            width: 720,
            height: 1280,
            crop: "pad",
            quality: 'auto'
        }],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `reel-${uniqueSuffix}`;
        },
    },
});

// Configure thumbnail storage on Cloudinary
const thumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'public/uploads/thumbnails',
        format: 'jpg',
        resource_type: 'image',
        transformation: [{
            width: 720,
            height: 1280,
            crop: "pad",
            quality: 'auto'
        }],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `thumbnail-${uniqueSuffix}`;
        },
    },
});

// File filter for videos
const videoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Not a video file! Please upload only videos.'), false);
    }
};

// Configure multer for video uploads
const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});

// Configure multer for thumbnail uploads
const uploadThumbnail = multer({
    storage: thumbnailStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for thumbnails
    }
});

module.exports = {
    uploadVideo,
    uploadThumbnail
};