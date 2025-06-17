const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Route pour initialiser l'admin (accès restreint)
router.post('/init', adminController.createDefaultAdmin);

module.exports = router;