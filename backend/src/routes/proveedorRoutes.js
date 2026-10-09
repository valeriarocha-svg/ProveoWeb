const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const autenticar = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const { uploadProfileImages } = require('../middlewares/profileImageUpload');

router.get('/buscar', proveedorController.obtenerProveedores);
router.get('/perfil', autenticar, permitirRoles('proveedor'), proveedorController.obtenerPerfil);
router.put('/perfil', autenticar, permitirRoles('proveedor'), proveedorController.actualizarPerfil);
router.post(
  '/perfil/imagenes',
  autenticar,
  permitirRoles('proveedor'),
  uploadProfileImages,
  proveedorController.subirImagenesPerfil
);

module.exports = router;