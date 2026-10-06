require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/v1/ping', (req, res) => res.status(200).json({ mensaje: 'Backend conectado a PostgreSQL' }));
app.use('/api/v1/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en puerto ${PORT}`));
