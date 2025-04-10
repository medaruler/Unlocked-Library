const express = require('express');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { User } = require('../models/sequelize'); // Updated import for Sequelize
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [{ email }, { username }] 
            }
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id, // Updated for Sequelize
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error registering user',
            error: error.message 
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password); // Assuming this method is still valid
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error logging in',
            error: error.message 
        });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id); // Updated for Sequelize
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
        res.json(user);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching profile',
            error: error.message 
        });
    }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'profilePicture'];
    const isValidOperation = updates.every(update => 
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).json({ 
            message: 'Invalid updates' 
        });
    }

    try {
        const user = await User.findByPk(req.user.id); // Updated for Sequelize
        updates.forEach(update => {
            user[update] = req.body[update];
        });
        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: req.user
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Error updating profile',
            error: error.message 
        });
    }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ 
            message: 'Error changing password',
            error: error.message 
        });
    }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
    try {
        // In a real application, you might want to invalidate the token
        // This would require implementing a token blacklist
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error logging out',
            error: error.message 
        });
    }
});

module.exports = router;
