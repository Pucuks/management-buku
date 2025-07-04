const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    kodebuku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    penerbit: {
        type: DataTypes.STRING
    },
    tahun: {
        type: DataTypes.INTEGER
    },
    kategori: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
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
    tableName: 'books',
    timestamps: false
});
Book.associate = function (models) {
    Book.hasMany(models.Peminjaman, {
        foreignKey: 'buku_id',
        as: 'Peminjaman'
    });

    Book.hasMany(models.Inventory, {
        foreignKey: 'buku_id',
        as: 'inventories'
    });
};


module.exports = Book;