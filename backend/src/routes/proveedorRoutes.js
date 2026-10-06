const express = require('express');
const router = express.Router();

const proveedorController = require('../controllers/proveedorController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/me', verificarToken, proveedorController.getMyProfile);
router.put('/me', verificarToken, proveedorController.saveOrUpdateProfile);

module.exports = router;