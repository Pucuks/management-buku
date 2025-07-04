const Student = require('../models/student');

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            order: [['id', 'ASC']]
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createStudent = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: 'Nama mahasiswa wajib diisi' });
        }

        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.body.name) {
            return res.status(400).json({ message: 'Nama mahasiswa wajib diisi' });
        }

        const [updated] = await Student.update(req.body, {
            where: { id }
        });

        if (updated) {
            const updatedStudent = await Student.findByPk(id);
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Student.destroy({
            where: { id }
        });

        if (deleted) {
            res.json({ message: 'Mahasiswa berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};