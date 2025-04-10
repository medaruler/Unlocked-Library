const express = require('express');
const multer = require('multer');
const { uploadFile, deleteFile } = require('../config/google-cloud');
const Video = require('../models/sequelize/Video'); // Updated import for Sequelize
const { auth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
    }
});

// Upload video
router.post('/', auth, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        
        if (!req.files['video'] || !req.files['thumbnail']) {
            return res.status(400).json({ message: 'Both video and thumbnail are required' });
        }

        // Upload files to Google Cloud Storage
        const videoUrl = await uploadFile(req.files['video'][0], 'videos');
        const thumbnailUrl = await uploadFile(req.files['thumbnail'][0], 'thumbnails');

        const video = new Video({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            author: req.user.id, // Updated for Sequelize
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await video.save();

        res.status(201).json({
            message: 'Video uploaded successfully',
            video: await video.populate('author', 'username profilePicture')
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error uploading video',
            error: error.message
        });
    }
});


// Get all videos (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const videos = await Video.find({ status: 'public' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username profilePicture');

        const total = await Video.countDocuments({ status: 'public' });

        res.json({
            videos,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalVideos: total
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching videos',
            error: error.message
        });
    }
});

// Get single video
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture');

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Increment view count
        video.views += 1;
        await video.save();

        res.json(video);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching video',
            error: error.message
        });
    }
});

// Update video
router.patch('/:id', auth, async (req, res) => {
    try {
        const video = await Video.findOne({
            _id: req.params.id,
            author: req.user._id
        });

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'category', 'tags', 'status'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => {
            if (update === 'tags') {
                video[update] = req.body[update].split(',').map(tag => tag.trim());
            } else {
                video[update] = req.body[update];
            }
        });

        await video.save();
        res.json(video);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating video',
            error: error.message
        });
    }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
    try {
        const video = await Video.findOne({
            _id: req.params.id,
            author: req.user._id
        });

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Extract public IDs from URLs
        const videoPublicId = video.videoUrl.split('/').slice(-2, -1)[0];
        const thumbnailPublicId = video.thumbnailUrl.split('/').slice(-2, -1)[0];

        // Delete from Cloudinary
        await Promise.all([
            cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' }),
            cloudinary.uploader.destroy(thumbnailPublicId)
        ]);

        // Delete from database
        await video.deleteOne();

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting video',
            error: error.message
        });
    }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const comment = {
            user: req.user._id,
            text: req.body.text
        };

        video.comments.push(comment);
        await video.save();

        // Populate user info for the new comment
        const populatedVideo = await Video.findById(video._id)
            .populate('comments.user', 'username profilePicture');

        res.status(201).json(populatedVideo.comments[populatedVideo.comments.length - 1]);
    } catch (error) {
        res.status(400).json({
            message: 'Error adding comment',
            error: error.message
        });
    }
});

// Like/Unlike video
router.post('/:id/like', auth, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const likeIndex = video.likes.indexOf(req.user._id);
        const dislikeIndex = video.dislikes.indexOf(req.user._id);

        if (likeIndex > -1) {
            // Unlike
            video.likes.splice(likeIndex, 1);
        } else {
            // Like
            video.likes.push(req.user._id);
            // Remove from dislikes if present
            if (dislikeIndex > -1) {
                video.dislikes.splice(dislikeIndex, 1);
            }
        }

        await video.save();
        res.json({
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            liked: likeIndex === -1
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error processing like',
            error: error.message
        });
    }
});

module.exports = router;
