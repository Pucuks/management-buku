const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    buku_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rak_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'inventories',
    timestamps: false
});

Inventory.associate = function (models) {
    Inventory.belongsTo(models.Book, {
        foreignKey: 'buku_id',
        as: 'book'
    });
    Inventory.belongsTo(models.Rak, {
        foreignKey: 'rak_id',
        as: 'rak'
    });
};

module.exports = Inventory;