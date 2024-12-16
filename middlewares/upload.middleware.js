const upload = require("./gridfs.middleware");

// Middleware to handle single file uploads
const uploadMiddleware = upload.single("video");

exports.uploadFile = (req, res) => {
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error("Multer error:", err.message);

            // Handle specific Multer errors
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File size exceeds the limit.",
                    error: err.message,
                });
            }

            return res.status(500).json({
                success: false,
                message: "File upload failed.",
                error: err.message,
            });
        }

        // Check if a file was uploaded
        if (!req.file) {
            console.error("No file uploaded.");
            return res.status(400).json({
                success: false,
                message: "No file uploaded. Please provide a valid file.",
            });
        }

        // Log the uploaded file details
        console.log("File uploaded successfully:", req.file);

        // Send success response
        res.status(200).json({
            success: true,
            message: "File uploaded successfully.",
            file: req.file,
        });
    });
};
