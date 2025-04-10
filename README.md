# Unlocked Library

An uncensored video and wiki sharing platform built with Node.js, Express, and MongoDB.

## Features

- User Authentication (Sign up, Login)
- Video Upload and Sharing
- Wiki Creation and Collaboration
- Content Management
- User Profiles

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- AWS S3 Account (for video storage)
- Cloudinary Account (for image storage)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

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

3. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "string",
    "password": "string"
}
```

### Videos

#### Upload a video
```http
POST /api/videos/upload
Content-Type: multipart/form-data

video: File
title: string
description: string
category: string
tags: string[]
```

#### Get videos
```http
GET /api/videos
```

### Wikis

#### Create a wiki
```http
POST /api/wikis
Content-Type: application/json

{
    "title": "string",
    "content": "string",
    "categories": "string[]",
    "tags": "string[]"
}
```

#### Get wikis
```http
GET /api/wikis
```

## Implementation Guide

### 1. User Authentication

The authentication system is implemented using JWT (JSON Web Tokens). Key files:
- `models/User.js`: User model with password hashing
- `routes/auth.js`: Authentication routes
- `middleware/auth.js`: Authentication middleware

To implement signup/login:
1. Frontend sends credentials to respective endpoints
2. Backend validates, creates/authenticates user
3. JWT token is returned and should be stored in localStorage
4. Include token in Authorization header for protected routes

### 2. Video Upload

Video upload uses AWS S3 for storage. Implementation steps:
1. Configure AWS S3 credentials in `.env`
2. Use multer for handling file uploads
3. Generate presigned URLs for video upload/viewing
4. Store video metadata in MongoDB
5. Handle video processing status

### 3. Wiki System

Wiki system supports collaborative editing. Implementation:
1. Create new wiki through POST endpoint
2. Support markdown content
3. Track revision history
4. Implement contributor system
5. Add categories and tags

### 4. Frontend Integration

1. Use the provided API endpoints in your frontend code
2. Implement proper error handling
3. Add loading states for async operations
4. Handle token expiration and refresh

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
