const Book = require('../models/book');
const path = require('path');
const fs = require('fs');

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll({
            order: [['id', 'ASC']]
        });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBook = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.title) {
            return res.status(400).json({ message: 'Judul buku wajib diisi' });
        }

        const bookData = {
            ...req.body,
            image: req.file ? req.file.filename : null
        };

        const book = await Book.create(bookData);
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).json({ message: 'Buku tidak ditemukan' });
        }

        // Validate required fields
        if (!req.body.title) {
            return res.status(400).json({ message: 'Judul buku wajib diisi' });
        }

        const updateData = {
            ...req.body,
            image: req.file ? req.file.filename : book.image
        };

        // Hapus file lama jika diupdate dengan file baru
        if (req.file && book.image) {
            const oldImagePath = path.join('public/uploads', book.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        await book.update(updateData);
        res.json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).json({ message: 'Buku tidak ditemukan' });
        }

        // Hapus file gambar jika ada
        if (book.image) {
            const imagePath = path.join('public/uploads', book.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await book.destroy();
        res.json({ message: 'Buku berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};