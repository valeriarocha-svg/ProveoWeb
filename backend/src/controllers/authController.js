const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const ROLES_PERMITIDOS = ['cliente', 'proveedor'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role)
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        if (!EMAIL_REGEX.test(email))
            return res.status(400).json({ error: 'Correo inválido' });
        if (!ROLES_PERMITIDOS.includes(role))
            return res.status(400).json({ error: 'Rol inválido' });
        if (password.length < 8)
            return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });

        const existente = await userRepository.findByEmail(email);
        if (existente)
            return res.status(409).json({ error: 'El correo ya está registrado' });

        const passwordHash = await bcrypt.hash(password, 10);
        const id = await userRepository.create({ email, passwordHash, role });

        res.status(201).json({ id, email, role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });

        const user = await userRepository.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password_hash)))
            return res.status(401).json({ error: 'Credenciales incorrectas' });

        const token = jwt.sign({ id: user.id, role: user.role },
            process.env.JWT_SECRET, { expiresIn: '2h' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

module.exports = { register, login };