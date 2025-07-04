const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nim: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [8, 20]
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    department: {
        type: DataTypes.STRING
    },
    angkatan: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: true,
            min: 2000,
            max: new Date().getFullYear()
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Aktif',
        validate: {
            isIn: [['Aktif', 'Non-Aktif', 'Lulus', 'Drop Out']]
        }
    },
    telephone: {
        type: DataTypes.STRING,
        validate: {
            is: /^[0-9]{10,15}$/i
        }
    }
}, {
    tableName: 'students',
    timestamps: false,
    underscored: true,
    paranoid: false,
    defaultScope: {
        attributes: {
            exclude: ['created_at', 'updated_at'] // Sembunyikan field ini di query default
        }
    },
    scopes: {
        active: {
            where: {
                status: 'Aktif'
            }
        }
    }
});

// Definisikan asosiasi
Student.associate = function (models) {
    Student.hasMany(models.Peminjaman, {
        foreignKey: 'mahasiswa_nim',
        sourceKey: 'nim',
        as: 'Peminjamans'
    });
};



module.exports = Student;