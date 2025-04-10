const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: 2000
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    thumbnailUrl: {
        type: String,
        required: [true, 'Thumbnail URL is required']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: true,
        enum: ['politics', 'education', 'entertainment', 'news', 'other']
    },
    status: {
        type: String,
        enum: ['processing', 'public', 'private'],
        default: 'processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
videoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes for better query performance
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ author: 1, createdAt: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ tags: 1 });

module.exports = mongoose.model('Video', videoSchema);
