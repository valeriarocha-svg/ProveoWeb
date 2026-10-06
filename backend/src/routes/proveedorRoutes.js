const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

router.get('/buscar', proveedorController.obtenerProveedores);

module.exports = router;