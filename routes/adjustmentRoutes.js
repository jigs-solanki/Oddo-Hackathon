const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adjustmentController');

router.get('/', ctrl.list);
router.get('/create', ctrl.showCreate);
router.post('/create', ctrl.create);

module.exports = router;
