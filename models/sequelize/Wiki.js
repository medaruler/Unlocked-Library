const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Wiki = sequelize.define('Wiki', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [1, 200]
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('draft', 'published', 'under_review', 'archived'),
            defaultValue: 'published'
        },
        visibility: {
            type: DataTypes.ENUM('public', 'private', 'contributors_only'),
            defaultValue: 'public'
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        categories: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        references: {
            type: DataTypes.JSONB,
            defaultValue: []
        }
    }, {
        timestamps: true
    });

    Wiki.associate = (models) => {
        Wiki.belongsTo(models.User, {
            as: 'author',
            foreignKey: {
                name: 'authorId',
                allowNull: false
            }
        });

        Wiki.belongsToMany(models.User, {
            through: 'WikiContributors',
            as: 'contributors',
            foreignKey: 'wikiId'
        });

        Wiki.hasMany(models.WikiRevision, {
            as: 'revisions',
            foreignKey: 'wikiId'
        });

        Wiki.belongsToMany(models.User, {
            through: 'WikiLikes',
            as: 'likedBy',
            foreignKey: 'wikiId'
        });
    };

    return Wiki;
};
