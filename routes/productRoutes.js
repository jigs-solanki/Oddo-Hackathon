const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

router.get('/', ctrl.list);
router.get('/create', ctrl.showCreate);
router.post('/create', ctrl.create);
router.get('/edit/:id', ctrl.showEdit);
router.put('/edit/:id', ctrl.update);
router.delete('/delete/:id', ctrl.remove);

module.exports = router;
