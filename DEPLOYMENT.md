# Deployment Guide for Google Cloud Platform

## Prerequisites

1. Create a Google Cloud Account
2. Install Google Cloud SDK
3. Install MongoDB Atlas (for database)
4. Create AWS S3 account (for video storage)
5. Create Cloudinary account (for image storage)

## Step-by-Step Deployment Guide

### 1. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster (free tier works)
3. Set up database access:
   - Create a database user
   - Set a secure password
4. Set up network access:
   - Add IP access list entry: 0.0.0.0/0 (allow from anywhere)
5. Get your MongoDB connection string

### 2. Set Up Google Cloud Project

1. Create new project:
```bash
gcloud projects create unlocked-library-[unique-id]
gcloud config set project unlocked-library-[unique-id]
```

2. Enable required APIs:
```bash
gcloud services enable compute.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 3. Configure App Engine

1. Create app.yaml configuration:
```yaml
runtime: nodejs16
env: standard

env_variables:
  NODE_ENV: "production"
  MONGODB_URI: "your_mongodb_atlas_uri"
  JWT_SECRET: "your_jwt_secret"
  AWS_ACCESS_KEY_ID: "your_aws_access_key"
  AWS_SECRET_ACCESS_KEY: "your_aws_secret_key"
  AWS_REGION: "your_aws_region"
  AWS_BUCKET_NAME: "your_bucket_name"
  CLOUDINARY_CLOUD_NAME: "your_cloudinary_name"
  CLOUDINARY_API_KEY: "your_cloudinary_key"
  CLOUDINARY_API_SECRET: "your_cloudinary_secret"

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10

handlers:
  - url: /.*
    script: auto
    secure: always
```

### 4. Deploy to Google Cloud

1. Initialize App Engine:
```bash
gcloud app create --region=us-central
```

2. Deploy the application:
```bash
gcloud app deploy
```

3. View the application:
```bash
gcloud app browse
```

### 5. Set Up Domain (Optional)

1. Go to Google Cloud Console
2. Navigate to App Engine > Settings > Custom Domains
3. Click "Add Custom Domain"
4. Follow the verification steps

### 6. Monitoring and Maintenance

1. View logs:
```bash
gcloud app logs tail
```

2. Monitor performance:
- Go to Google Cloud Console
- Navigate to App Engine > Dashboard

### 7. Cost Management

1. Set up budget alerts:
- Go to Billing > Budgets & Alerts
- Create a new budget
- Set monthly limits and alert thresholds

2. Monitor costs:
- Use Google Cloud's Cost Management tools
- Regularly check billing dashboard

## Security Considerations

1. Keep environment variables secure
2. Regularly update dependencies
3. Enable Google Cloud Security Scanner
4. Set up firewall rules
5. Implement rate limiting
6. Use secure sessions and JWT

## Troubleshooting

1. Check application logs:
```bash
gcloud app logs tail
```

2. Common issues:
- Connection timeouts: Check MongoDB Atlas network access
- File upload issues: Verify AWS/Cloudinary credentials
- Performance issues: Check instance scaling settings

## Scaling Tips

1. Enable Memorystore for Redis caching
2. Use Cloud CDN for static assets
3. Implement proper database indexing
4. Set up load balancing
5. Configure automatic scaling properly

## Backup Strategy

1. MongoDB Atlas automatic backups
2. Regular exports of critical data
3. Version control for code changes
4. Document all configuration changes

## Maintenance Tasks

1. Regular dependency updates
2. Log rotation and cleanup
3. Database optimization
4. Performance monitoring
5. Security patches
