const { sequelize } = require('../models');
const Peminjaman = require('../models/Peminjaman');
const Book = require('../models/book');
const Student = require('../models/student');
const Inventory = require('../models/Inventory');

exports.create = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { nim, items } = req.body;

        if (!nim || !items || !Array.isArray(items)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'NIM dan items harus diisi'
            });
        }

        const inventoryItems = await Inventory.findAll({
            where: {
                buku_id: items.map(item => item.id)
            },
            transaction
        });

        for (const item of items) {
            const inventory = inventoryItems.find(i => i.buku_id === item.id);
            if (!inventory || inventory.jumlah < 1) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Buku dengan ID ${item.id} tidak tersedia`
                });
            }
        }

        const peminjamanRecords = await Promise.all(
            items.map(async (item) => {
                await Inventory.decrement('jumlah', {
                    where: { buku_id: item.id },
                    by: 1,
                    transaction
                });

                return await Peminjaman.create({
                    mahasiswa_nim: String(nim),
                    buku_id: item.id
                }, { transaction });
            })
        );

        await transaction.commit();

        res.json({
            success: true,
            message: 'Peminjaman berhasil disimpan',
            data: peminjamanRecords
        });
    } catch (err) {
        await transaction.rollback();
        console.error('Error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Terjadi kesalahan server'
        });
    }
};

exports.checkStock = async (req, res) => {
    try {
        const { bookId } = req.params;
        const inventory = await Inventory.findOne({
            where: { buku_id: bookId }
        });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Buku tidak ditemukan di inventory'
            });
        }

        res.json({
            success: true,
            available: inventory.jumlah > 0,
            stock: inventory.jumlah
        });
    } catch (err) {
        console.error('Error checking stock:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memeriksa stok buku'
        });
    }
};

exports.history = async (req, res) => {
    try {
        const { nim } = req.query;
        const whereCondition = {};

        if (nim) {
            whereCondition.mahasiswa_nim = nim;
        }

        const data = await Peminjaman.findAll({
            where: whereCondition,
            include: [
                {
                    model: Book,
                    as: 'Book',
                    attributes: ['id', 'kodebuku', 'title', 'author', 'penerbit']
                },
                {
                    model: Student,
                    as: 'Student',
                    attributes: ['id', 'name', 'department']
                }
            ],
            order: [['tanggal_pinjam', 'DESC']]
        });

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data history peminjaman tidak ditemukan'
            });
        }

        const result = data.map(item => ({
            id: item.id,
            nim: item.mahasiswa_nim,
            nama: item.Student?.name || 'Tidak diketahui',
            tanggal_pinjam: item.tanggal_pinjam,
            tanggal_kembali: item.tanggal_kembali,
            buku: {
                kodebuku: item.Book?.kodebuku || '',
                judul: item.Book?.title || '',
                pengarang: item.Book?.author || '',
                penerbit: item.Book?.penerbit || ''
            }
        }));

        res.json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data history'
        });
    }
};

exports.kembalikan = async (req, res) => {
    try {
        const { id } = req.params;
        const peminjaman = await Peminjaman.findByPk(id);

        if (!peminjaman) {
            return res.status(404).json({
                success: false,
                message: 'Data peminjaman tidak ditemukan'
            });
        }

        if (peminjaman.tanggal_kembali) {
            return res.status(400).json({
                success: false,
                message: 'Buku sudah dikembalikan sebelumnya'
            });
        }

        peminjaman.tanggal_kembali = new Date();
        await peminjaman.save();

        await Inventory.increment('jumlah', {
            where: { buku_id: peminjaman.buku_id },
            by: 1
        });

        res.json({
            success: true,
            message: 'Buku berhasil dikembalikan',
            data: {
                id: peminjaman.id,
                tanggal_kembali: peminjaman.tanggal_kembali
            }
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat proses pengembalian'
        });
    }
};