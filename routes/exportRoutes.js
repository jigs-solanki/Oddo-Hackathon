const express = require('express');
const router = express.Router();
const exportCtrl = require('../controllers/exportController');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, exportCtrl.exportData);

module.exports = router;
