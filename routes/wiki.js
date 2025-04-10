const express = require('express');
const { Wiki, User } = require('../models/sequelize'); // Updated import for Sequelize
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create wiki post
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, categories, tags, references, visibility } = req.body;

        // Check for duplicate title
        const existingWiki = await Wiki.findOne({ where: { title } });
        if (existingWiki) {
            return res.status(400).json({
                message: 'A wiki post with this title already exists'
            });
        }

        const wiki = await Wiki.create({
            title,
            content,
            authorId: req.user.id, // Updated for Sequelize
            categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            references: references || [],
            visibility,
            lastEditedBy: req.user.id // Updated for Sequelize
        });

        res.status(201).json({
            message: 'Wiki post created successfully',
            wiki
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating wiki post',
            error: error.message
        });
    }
});

// Get all wiki posts (with pagination and filters)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query based on filters
        const query = { status: 'published' };
        
        if (req.query.category) {
            query.categories = req.query.category;
        }
        
        if (req.query.tag) {
            query.tags = req.query.tag;
        }

        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Execute query with pagination
        const wikis = await Wiki.findAll({
            where: query,
            order: [['createdAt', 'DESC']],
            offset: skip,
            limit: limit,
            include: [{ model: User, as: 'author', attributes: ['username', 'profilePicture'] }]
        });

        const total = await Wiki.count({ where: query });

        res.json({
            wikis,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalWikis: total
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching wiki posts',
            error: error.message
        });
    }
});

// Get single wiki post
router.get('/:id', async (req, res) => {
    try {
        const wiki = await Wiki.findByPk(req.params.id, {
            include: [{ model: User, as: 'author', attributes: ['username', 'profilePicture'] }]
        });

        if (!wiki) {
            return res.status(404).json({ message: 'Wiki post not found' });
        }

        // Increment view count
        wiki.views += 1;
        await wiki.save();

        res.json(wiki);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching wiki post',
            error: error.message
        });
    }
});

// Update wiki post
router.patch('/:id', auth, async (req, res) => {
    try {
        const wiki = await Wiki.findByPk(req.params.id);

        if (!wiki) {
            return res.status(404).json({ message: 'Wiki post not found' });
        }

        // Check if user has permission to edit
        if (wiki.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this wiki post' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'content', 'categories', 'tags', 'references', 'visibility', 'status'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        // Update fields
        updates.forEach(update => {
            if (update === 'categories' || update === 'tags') {
                wiki[update] = req.body[update].split(',').map(item => item.trim());
            } else {
                wiki[update] = req.body[update];
            }
        });

        wiki.lastEditedBy = req.user.id; // Updated for Sequelize

        await wiki.save();
        res.json(wiki);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating wiki post',
            error: error.message
        });
    }
});

// Delete wiki post
router.delete('/:id', auth, async (req, res) => {
    try {
        const wiki = await Wiki.findOne({
            where: {
                id: req.params.id,
                authorId: req.user.id
            }
        });

        if (!wiki) {
            return res.status(404).json({ message: 'Wiki post not found' });
        }

        await wiki.destroy();
        res.json({ message: 'Wiki post deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting wiki post',
            error: error.message
        });
    }
});

// Like/Unlike wiki post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const wiki = await Wiki.findByPk(req.params.id);
        
        if (!wiki) {
            return res.status(404).json({ message: 'Wiki post not found' });
        }

        const likeIndex = wiki.likes.indexOf(req.user.id);

        if (likeIndex > -1) {
            // Unlike
            wiki.likes.splice(likeIndex, 1);
        } else {
            // Like
            wiki.likes.push(req.user.id);
        }

        await wiki.save();
        res.json({
            likes: wiki.likes.length,
            liked: likeIndex === -1
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error processing like',
            error: error.message
        });
    }
});

// Add revision comment
router.post('/:id/revisions', auth, async (req, res) => {
    try {
        const wiki = await Wiki.findByPk(req.params.id);
        
        if (!wiki) {
            return res.status(404).json({ message: 'Wiki post not found' });
        }

        const revision = {
            content: wiki.content,
            editedBy: req.user.id,
            changeDescription: req.body.changeDescription
        };

        wiki.revisionHistory.push(revision);
        await wiki.save();

        const populatedWiki = await Wiki.findByPk(wiki.id, {
            include: [{ model: User, as: 'revisionHistory', attributes: ['username'] }]
        });

        res.status(201).json(
            populatedWiki.revisionHistory[populatedWiki.revisionHistory.length - 1]
        );
    } catch (error) {
        res.status(400).json({
            message: 'Error adding revision',
            error: error.message
        });
    }
});

module.exports = router;
