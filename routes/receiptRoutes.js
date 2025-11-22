const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/receiptController');

router.get('/', ctrl.list);
router.get('/create', ctrl.showCreate);
router.get('/:id', ctrl.show);
router.post('/create', ctrl.create);

module.exports = router;
