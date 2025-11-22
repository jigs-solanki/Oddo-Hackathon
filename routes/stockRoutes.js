const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stockController');

router.get('/', ctrl.list);
router.post('/:id/update', ctrl.update);

module.exports = router;
