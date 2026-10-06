// backend/src/controllers/proveedorController.js
const profileRepository = require('../repositories/profileRepository');

const proveedorController = {
    async getMyProfile(req, res) {
        try {
            const userId = req.user.id; // Obtenido del token JWT gracias al middleware
            const profile = await profileRepository.findByUserId(userId);

            if (!profile) {
                return res.status(404).json({ error: 'Perfil no encontrado. Puedes crearlo.' });
            }

            return res.json(profile);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener el perfil' });
        }
    },

    async saveOrUpdateProfile(req, res) {
        try {
            const userId = req.user.id; // ID del usuario autenticado
            const profile = await profileRepository.createOrUpdate(userId, req.body);

            return res.status(200).json({
                mensaje: 'Perfil guardado con éxito',
                profile
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al guardar el perfil' });
        }
    }
};

module.exports = proveedorController;
const verifyToken = require('../middlewares/authMiddleware');