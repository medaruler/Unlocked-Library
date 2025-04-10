require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const wikiRoutes = require('./routes/wiki');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unlocked-library',
        allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'webm']
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50000000 // 50MB default
    }
});

const app = express();

// Trust proxy settings for rate limiter
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use(express.static('public'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/wiki', wikiRoutes);

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server without MongoDB for development
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
});

// Mock data
const mockVideos = [
    {
        id: '1',
        title: 'Understanding Free Speech',
        description: 'A comprehensive guide to freedom of expression',
        url: 'https://example.com/video1.mp4',
        thumbnail: '/images/default-thumbnail.jpg',
        author: 'testuser',
        views: 1200,
        likes: ['user1', 'user2']
    },
    {
        id: '2',
        title: 'Digital Rights',
        description: 'Exploring rights in the digital age',
        url: 'https://example.com/video2.mp4',
        thumbnail: '/images/default-thumbnail.jpg',
        author: 'testuser',
        views: 800,
        likes: ['user3']
    }
];

const mockWikis = [
    {
        id: '1',
        title: 'History of Free Speech',
        excerpt: 'Exploring the evolution of free speech throughout history...',
        content: 'Full content here...',
        author: 'testuser',
        lastModified: '2023-07-20',
        tags: ['history', 'rights', 'freedom']
    },
    {
        id: '2',
        title: 'Digital Privacy',
        excerpt: 'Understanding privacy in the modern age...',
        content: 'Full content here...',
        author: 'admin',
        lastModified: '2023-07-19',
        tags: ['privacy', 'technology', 'rights']
    }
];

// Mock auth endpoints for development
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Mock user for testing
    if (username === 'testuser' && password === 'testpass123') {
        res.json({
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            }
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    // Mock registration
    res.status(201).json({
        message: 'User registered successfully',
        token: 'mock-jwt-token',
        user: {
            id: '1',
            username,
            email,
            role: 'user'
        }
    });
});

// Mock video endpoints
app.get('/api/videos', (req, res) => {
    const { type } = req.query;
    let videos = [...mockVideos];
    
    if (type === 'user' && req.headers.authorization) {
        // Filter videos by logged-in user
        videos = videos.filter(video => video.author === 'testuser');
    }
    
    res.json({ videos });
});

// Mock wiki endpoints
app.get('/api/wiki', (req, res) => {
    const { type } = req.query;
    let wikis = [...mockWikis];
    
    if (type === 'user' && req.headers.authorization) {
        // Filter wikis by logged-in user
        wikis = wikis.filter(wiki => wiki.author === 'testuser');
    }
    
    res.json({ wikis });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
