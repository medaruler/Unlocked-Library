const mongoose = require('mongoose');

const wikiSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contributors: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        contribution: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    revisionHistory: [{
        content: {
            type: String,
            required: true
        },
        editedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        editedAt: {
            type: Date,
            default: Date.now
        },
        changeDescription: {
            type: String,
            required: true
        }
    }],
    categories: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    references: [{
        title: String,
        url: String,
        description: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'under_review', 'archived'],
        default: 'published'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'contributors_only'],
        default: 'public'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Update timestamps before saving
wikiSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (!this.isModified('content')) return next();
    
    // Add to revision history if content is modified
    const revision = {
        content: this.content,
        editedBy: this.lastEditedBy,
        changeDescription: 'Content updated'
    };
    
    if (!this.revisionHistory) {
        this.revisionHistory = [];
    }
    this.revisionHistory.push(revision);
    next();
});

// Add text indexes for search functionality
wikiSchema.index({ title: 'text', content: 'text', tags: 'text' });
wikiSchema.index({ author: 1, createdAt: -1 });
wikiSchema.index({ categories: 1 });
wikiSchema.index({ status: 1 });

module.exports = mongoose.model('Wiki', wikiSchema);
