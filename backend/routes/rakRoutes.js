const express = require('express');
const router = express.Router();
const {
    getAllRaks,
    createRak,
    getRakById,
    updateRak,
    deleteRak,
    addInventory,
    getInventoriesByRakId,
    updateInventory,
    deleteInventory
} = require('../controllers/rakController');

// Rak Routes
router.get('/', getAllRaks);
router.post('/', createRak);
router.get('/:id', getRakById);
router.get('/:id/inventories', getInventoriesByRakId);
router.put('/:id', updateRak);
router.delete('/:id', deleteRak);

// Inventory Routes
router.post('/inventory', addInventory);
router.put('/inventory/:id', updateInventory);
router.delete('/inventory/:id', deleteInventory);

module.exports = router;