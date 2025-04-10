const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error('User not found');
        }

        // Add user to request object
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Middleware for admin-only routes
const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate as admin' });
    }
};

// Middleware for file upload size limit
const uploadSizeLimit = (req, res, next) => {
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB limit for video uploads
    
    if (req.headers['content-length'] > MAX_SIZE) {
        return res.status(413).json({ 
            message: 'File too large. Maximum size is 100MB' 
        });
    }
    
    next();
};

// Rate limiting middleware
const rateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};

module.exports = {
    auth,
    adminAuth,
    uploadSizeLimit,
    rateLimit
};
