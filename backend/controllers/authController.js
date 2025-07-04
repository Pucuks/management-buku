const jwt = require('jsonwebtoken');
const db = require('../models');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        const user = await db.User.findOne({
            where: { username },
            include: [{
                model: db.Student,
                as: 'Student',
                required: false
            }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        const isValid = await user.validPassword(password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        if (user.Student) {
            tokenPayload.nim = user.Student.nim;
            tokenPayload.name = user.Student.name;
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



exports.getMe = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data user'
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, password, role, student_id } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi'
            });
        }


        const existingUser = await db.User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah terdaftar'
            });
        }


        const newUser = await db.User.create({
            username,
            password,
            role: role || 'student',
            student_id: student_id || null
        });

        res.status(201).json({
            success: true,
            message: 'User berhasil dibuat',
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                student_id: newUser.student_id
            }
        });
    } catch (error) {
        console.error('Register error:', error);

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat registrasi',
            error: error.message
        });
    }
};
