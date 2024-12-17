const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");

// MongoDB URI
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("MongoURI is not accessible. Please set it in the environment variables.");
    process.exit(1); // Exit the process if the MongoDB URI is not provided
}

// File filter for video formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = /mp4|mkv|avi|mov|wmv|flv/; // Common video formats
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Error: File type not supported!"), false);
    }
};

// GridFS Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    console.error("Error generating filename:", err);
                    return reject(err);
                }
                const filename = buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads", // Ensure this matches your MongoDB GridFS bucket name
                };
                resolve(fileInfo);
            });
        });
    },
});

// Multer Middleware
const upload = multer({ storage, fileFilter });

// Export Middleware
module.exports = upload;
