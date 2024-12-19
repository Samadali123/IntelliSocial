const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const createGridFsStorage = () => {
    return new GridFsStorage({
        url: process.env.MONGO_URI,
        file: (req, file) => {
            return new Promise((resolve, reject) => {
                if (mongoose.connection.readyState !== 1) {
                    return reject(new Error('MongoDB connection is not established'));
                }

                crypto.randomBytes(16, (err, buf) => {
                    if (err) return reject(err);

                    const filename = `${buf.toString('hex')}${path.extname(file.originalname)}`;
                    resolve({
                        filename,
                        bucketName: 'uploads',
                        metadata: {
                            originalName: file.originalname,
                            mimetype: file.mimetype,
                            uploadedBy: req.user ? req.user.id : null,
                            uploadedAt: new Date()
                        }
                    });
                });
            });
        }
    });
};

exports.createVideoUpload = (options = {}) => {
    const storage = createGridFsStorage();
    return multer({
        storage,
        limits: { fileSize: 50 * 1024 * 1024, ...options.limits }
    });
};
