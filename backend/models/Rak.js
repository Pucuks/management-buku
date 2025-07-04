const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rak = sequelize.define('Rak', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    kode_rak: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    lokasi: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kapasitas: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    tableName: 'raks',
    timestamps: false
});

Rak.associate = function (models) {
    Rak.hasMany(models.Inventory, {
        foreignKey: 'rak_id',
        as: 'inventories'
    });
};

module.exports = Rak;