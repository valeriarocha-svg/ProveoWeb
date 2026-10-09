const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const authRoutes = require('./src/routes/authRoutes');
const proveedorRoutes = require('./src/routes/proveedorRoutes');

if (!process.env.JWT_SECRET) {
    throw new Error('Configura JWT_SECRET en backend/.env.local o en las variables de entorno.');
}

const app = express();
const uploadsPath = path.resolve(__dirname, 'uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.get('/api/v1/ping', (req, res) => {
    res.status(200).json({ mensaje: 'Backend de Proveo conectado' });
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/proveedores', proveedorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});
