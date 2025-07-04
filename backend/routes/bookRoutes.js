const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const upload = require('../middlewares/upload');

router.get('/', bookController.getAllBooks);
router.post('/', upload.single('image'), bookController.createBook);
router.put('/:id', upload.single('image'), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;