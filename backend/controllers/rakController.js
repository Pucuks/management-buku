const db = require('../models');

const getAllRaks = async (req, res) => {
    try {
        const raks = await db.Rak.findAll({
            include: [{
                model: db.Inventory,
                as: 'inventories',
                include: [{
                    model: db.Book,
                    as: 'book'
                }]
            }],
            order: [['kode_rak', 'ASC']]
        });
        res.json(raks);
    } catch (error) {
        console.error('Error in getAllRaks:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data rak',
            error: error.message
        });
    }
};

const createRak = async (req, res) => {
    try {
        console.log('Raw request body:', req.body);

        if (!req.body.kode_rak || typeof req.body.kode_rak !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Kode rak harus berupa string'
            });
        }

        if (!req.body.lokasi || typeof req.body.lokasi !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Lokasi harus berupa string'
            });
        }

        const existingRak = await db.Rak.findOne({
            where: { kode_rak: req.body.kode_rak }
        });

        if (existingRak) {
            return res.status(400).json({
                success: false,
                message: 'Kode rak sudah digunakan'
            });
        }

        const rak = await db.Rak.create({
            kode_rak: req.body.kode_rak,
            lokasi: req.body.lokasi,
            kapasitas: parseInt(req.body.kapasitas) || 0
        });

        return res.status(201).json({
            success: true,
            data: rak
        });
    } catch (error) {
        console.error('Detail error:', error);
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal',
                errors
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
};

const getRakById = async (req, res) => {
    try {
        const rak = await db.Rak.findByPk(req.params.id, {
            include: [{
                model: db.Inventory,
                as: 'inventories',
                include: [{
                    model: db.Book,
                    as: 'book'
                }]
            }]
        });

        if (!rak) {
            return res.status(404).json({
                success: false,
                message: 'Rak tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: rak
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data rak',
            error: error.message
        });
    }
};

const updateRak = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.body.kode_rak || !req.body.lokasi) {
            return res.status(400).json({
                success: false,
                message: 'Kode rak dan lokasi wajib diisi'
            });
        }

        const [updated] = await db.Rak.update(req.body, {
            where: { id }
        });

        if (updated) {
            const updatedRak = await db.Rak.findByPk(id);
            return res.json({
                success: true,
                data: updatedRak
            });
        }

        return res.status(404).json({
            success: false,
            message: 'Rak tidak ditemukan'
        });
    } catch (error) {
        console.error('Error updating rak:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui rak',
            error: error.message
        });
    }
};

const deleteRak = async (req, res) => {
    try {
        const { id } = req.params;

        const hasInventory = await db.Inventory.findOne({
            where: { rak_id: id }
        });

        if (hasInventory) {
            return res.status(400).json({
                success: false,
                message: 'Rak tidak bisa dihapus karena masih memiliki inventory'
            });
        }

        const deleted = await db.Rak.destroy({
            where: { id }
        });

        if (deleted) {
            return res.json({
                success: true,
                message: 'Rak berhasil dihapus'
            });
        }

        return res.status(404).json({
            success: false,
            message: 'Rak tidak ditemukan'
        });
    } catch (error) {
        console.error('Error deleting rak:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus rak',
            error: error.message
        });
    }
};

const addInventory = async (req, res) => {
    try {
        const { buku_id, rak_id, jumlah } = req.body;

        if (!buku_id || !rak_id || jumlah === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Data buku, rak dan jumlah wajib diisi'
            });
        }

        let inventory = await db.Inventory.findOne({
            where: { buku_id, rak_id }
        });

        if (inventory) {
            inventory.jumlah += parseInt(jumlah);
            await inventory.save();
        } else {
            inventory = await db.Inventory.create({
                buku_id,
                rak_id,
                jumlah
            });
        }

        return res.status(201).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Error adding inventory:', error);
        return res.status(400).json({
            success: false,
            message: 'Gagal menambah inventory',
            error: error.message
        });
    }
};

const getInventoriesByRakId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID rak tidak valid'
            });
        }

        const inventories = await db.Inventory.findAll({
            where: { rak_id: id },
            include: [
                {
                    model: db.Book,
                    as: 'book',
                    attributes: ['id', 'kodebuku', 'title', 'author', 'image']
                },
                {
                    model: db.Rak,
                    as: 'rak',
                    attributes: ['id', 'kode_rak', 'lokasi']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.json({
            success: true,
            data: inventories
        });
    } catch (error) {
        console.error('Error getting inventories:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data inventory',
            error: error.message
        });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { jumlah } = req.body;

        if (jumlah === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Jumlah wajib diisi'
            });
        }

        const [updated] = await db.Inventory.update({ jumlah }, {
            where: { id }
        });

        if (updated) {
            const updatedInventory = await db.Inventory.findByPk(id);
            return res.json({
                success: true,
                data: updatedInventory
            });
        }

        return res.status(404).json({
            success: false,
            message: 'Inventory tidak ditemukan'
        });
    } catch (error) {
        console.error('Error updating inventory:', error);
        return res.status(400).json({
            success: false,
            message: 'Gagal memperbarui inventory',
            error: error.message
        });
    }
};

const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Inventory.destroy({
            where: { id }
        });

        if (deleted) {
            return res.json({
                success: true,
                message: 'Inventory berhasil dihapus'
            });
        }

        return res.status(404).json({
            success: false,
            message: 'Inventory tidak ditemukan'
        });
    } catch (error) {
        console.error('Error deleting inventory:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus inventory',
            error: error.message
        });
    }
};

module.exports = {
    getAllRaks,
    createRak,
    getRakById,
    updateRak,
    deleteRak,
    addInventory,
    getInventoriesByRakId,
    updateInventory,
    deleteInventory
};