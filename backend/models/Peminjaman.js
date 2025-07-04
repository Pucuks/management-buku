const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Peminjaman = sequelize.define('Peminjaman', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mahasiswa_nim: {
        type: DataTypes.STRING, // Sesuaikan dengan tipe di database (VARCHAR/STRING)
        allowNull: false
    },
    buku_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tanggal_pinjam: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    tanggal_kembali: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'peminjaman',
    timestamps: false
});

Peminjaman.associate = function (models) {
    Peminjaman.belongsTo(models.Book, {
        foreignKey: 'buku_id',
        as: 'Book'
    });

    Peminjaman.belongsTo(models.Student, {
        foreignKey: 'mahasiswa_nim',
        targetKey: 'nim',
        as: 'Student'
    });


};

module.exports = Peminjaman;