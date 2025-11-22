const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/locationController');

router.get('/', ctrl.index);
router.post('/', ctrl.create);

module.exports = router;
