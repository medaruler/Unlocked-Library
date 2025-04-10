const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, {
            as: 'user',
            foreignKey: {
                name: 'userId',
                allowNull: false
            }
        });

        Comment.belongsTo(models.Video, {
            as: 'video',
            foreignKey: {
                name: 'videoId',
                allowNull: false
            }
        });

        Comment.belongsTo(models.Wiki, {
            as: 'wiki',
            foreignKey: {
                name: 'wikiId',
                allowNull: false
            }
        });
    };

    return Comment;
};
