const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const WikiRevision = sequelize.define('WikiRevision', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        editedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        changeDescription: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
    });

    WikiRevision.associate = (models) => {
        WikiRevision.belongsTo(models.Wiki, {
            as: 'wiki',
            foreignKey: {
                name: 'wikiId',
                allowNull: false
            }
        });

        WikiRevision.belongsTo(models.User, {
            as: 'editedBy',
            foreignKey: {
                name: 'userId',
                allowNull: false
            }
        });
    };

    return WikiRevision;
};
