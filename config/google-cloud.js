const { Storage } = require('@google-cloud/storage');
const { Sequelize } = require('sequelize');
const { CloudSqlConnector } = require('@google-cloud/cloud-sql-connector');

// Log the bucket name for debugging
console.log('Google Cloud Storage Bucket:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// Initialize Google Cloud Storage
const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// Initialize Cloud SQL connection
async function initDatabase() {
    try {
        const connector = new CloudSqlConnector();
        const clientOpts = await connector.getOptions({
            instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
            ipType: "PUBLIC"
        });

        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASS,
            {
                host: process.env.DB_HOST,
                dialect: 'postgres',
                dialectOptions: clientOpts,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                logging: process.env.NODE_ENV === 'development' ? console.log : false
            }
        );

        return sequelize;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

// Helper function for file uploads
async function uploadFile(file, folder = '') {
    try {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        const blob = bucket.file(fileName);
        
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype
            }
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => reject(error));
            blobStream.on('finish', async () => {
                // Make the file public
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                resolve(publicUrl);
            });
            blobStream.end(file.buffer);
        });
    } catch (error) {
        console.error('File upload failed:', error);
        throw error;
    }
}

// Helper function for file deletion
async function deleteFile(fileName) {
    try {
        await bucket.file(fileName).delete();
    } catch (error) {
        console.error('File deletion failed:', error);
        throw error;
    }
}

module.exports = {
    storage,
    bucket,
    initDatabase,
    uploadFile,
    deleteFile
};
