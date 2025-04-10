const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Video = sequelize.define('Video', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [1, 2000]
            }
        },
        videoUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        thumbnailUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        category: {
            type: DataTypes.ENUM('politics', 'education', 'entertainment', 'news', 'other'),
            defaultValue: 'other'
        },
        status: {
            type: DataTypes.ENUM('processing', 'public', 'private'),
            defaultValue: 'processing'
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        }
    }, {
        timestamps: true
    });

    Video.associate = (models) => {
        Video.belongsTo(models.User, {
            as: 'author',
            foreignKey: {
                name: 'authorId',
                allowNull: false
            }
        });

        Video.hasMany(models.Comment, {
            as: 'comments',
            foreignKey: 'videoId'
        });

        Video.belongsToMany(models.User, {
            through: 'VideoLikes',
            as: 'likedBy',
            foreignKey: 'videoId'
        });

        Video.belongsToMany(models.User, {
            through: 'VideoDislikes',
            as: 'dislikedBy',
            foreignKey: 'videoId'
        });
    };

    return Video;
};
