const mongoose = require('mongoose');

exports.cleanupGridFsFile = async (filename) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not established');
        }

        const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
        const files = await gfs.find({ filename }).toArray();

        if (files.length === 0) {
            console.warn(`No file found with filename: ${filename}`);
            return false;
        }

        await gfs.delete(files[0]._id);
        return true;
    } catch (error) {
        console.error('GridFS Cleanup Error:', error);
        return false;
    }
};
