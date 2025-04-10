# The Unlocked Library - Uncensored Video and Wiki Platform

A modern, uncensored platform for sharing videos and wiki content with complete freedom of expression. Built with Node.js, Express, MongoDB, and modern frontend technologies.

## Features

### Core Features
- 🎥 Video sharing and streaming
- 📚 Wiki content creation and management
- 🌓 Dark/Light mode support
- 🔐 Secure authentication system
- 🎨 Modern, responsive UI with Tailwind CSS
- 💭 Uncensored content sharing
- 🏛️ Political expression freedom

### Technical Features
- JWT-based authentication
- AWS S3 video storage
- MongoDB database
- Rich text editing
- Custom video player
- Real-time search
- Offline support with Service Workers
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS Account (for video storage)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/unlocked-library.git
cd unlocked-library
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/unlocked-library

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
unlocked-library/
├── public/
│   ├── js/
│   │   ├── main.js         # Main JavaScript file
│   │   ├── components.js   # UI components
│   │   ├── utils.js        # Utility functions
│   │   ├── config.js       # Frontend configuration
│   │   └── service-worker.js # Offline functionality
│   └── styles.css          # Custom styles
├── models/
│   ├── User.js            # User model
│   ├── Video.js           # Video model
│   └── Wiki.js            # Wiki model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── videos.js          # Video routes
│   └── wiki.js            # Wiki routes
├── middleware/
│   └── auth.js            # Authentication middleware
├── server.js              # Express server setup
└── package.json           # Project dependencies
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile
- POST `/api/auth/logout` - Logout user

### Videos
- POST `/api/videos` - Upload video
- GET `/api/videos` - List videos
- GET `/api/videos/:id` - Get single video
- PATCH `/api/videos/:id` - Update video
- DELETE `/api/videos/:id` - Delete video
- POST `/api/videos/:id/like` - Like/unlike video
- POST `/api/videos/:id/comments` - Add comment

### Wiki
- POST `/api/wiki` - Create wiki post
- GET `/api/wiki` - List wiki posts
- GET `/api/wiki/:id` - Get single wiki post
- PATCH `/api/wiki/:id` - Update wiki post
- DELETE `/api/wiki/:id` - Delete wiki post
- POST `/api/wiki/:id/like` - Like/unlike wiki post
- POST `/api/wiki/:id/revisions` - Add revision

## Frontend Components

### Video Player
- Custom controls
- Playback speed control
- Quality selection
- Fullscreen support
- Progress bar with preview

### Rich Text Editor
- Formatting options
- Image embedding
- Code blocks
- Markdown support
- Auto-save

### Search Component
- Real-time search
- Filter by type
- Sort options
- Relevance ranking

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- File upload restrictions
- Input validation
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@unlockedlibrary.com or join our Discord server.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AWS S3](https://aws.amazon.com/s3/)
