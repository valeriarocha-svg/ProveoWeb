require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. Importar las rutas de proveedores
const proveedorRoutes = require('./src/routes/proveedorRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba (Ping)
app.get('/api/v1/ping', (req, res) => {
    res.status(200).json({ mensaje: 'Backend de Proveo conectado' });
});

// 2. Montar las rutas en Express con su prefijo oficial
app.use('/api/v1/proveedores', proveedorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});

