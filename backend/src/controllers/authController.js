const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { normalizeMexicanPhone } = require('../utils/mexicanPhone');
const { validatePassword } = require('../utils/passwordPolicy');

const publicUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
});

const crearToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET debe estar configurada para emitir tokens de sesión.');
  }

  return jwt.sign(
    { rol: user.rol },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: '7d' }
  );
};

const registrar = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
  const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!nombreNormalizado || nombreNormalizado.length > 100) {
    return res.status(400).json({ error: 'El nombre es obligatorio y no debe superar 100 caracteres.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado) || emailNormalizado.length > 150) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'La contraseña debe tener entre 10 y 18 caracteres e incluir al menos una mayúscula, un número y un símbolo.',
    });
  }
  if (typeof req.body.telefono !== 'string' || !normalizeMexicanPhone(req.body.telefono)) {
    return res.status(400).json({ error: 'Ingresa un teléfono mexicano válido de 10 dígitos, con o sin el prefijo +52.' });
  }
  const telefono = normalizeMexicanPhone(req.body.telefono);
  if (!['cliente', 'proveedor'].includes(rol)) {
    return res.status(400).json({ error: 'El tipo de cuenta debe ser cliente o proveedor.' });
  }

  try {
    const duplicate = await db.query(
      `SELECT
         EXISTS (SELECT 1 FROM usuarios WHERE lower(trim(email)) = $1) AS email_exists,
         EXISTS (SELECT 1 FROM usuarios WHERE telefono = $2) AS telefono_exists`,
      [emailNormalizado, telefono]
    );

    if (duplicate.rows[0].email_exists) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
    }
    if (duplicate.rows[0].telefono_exists) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese número de teléfono.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nombre, email, rol`,
        [nombreNormalizado, emailNormalizado, telefono, passwordHash, rol]
      );
      const registeredUser = result.rows[0];

      if (rol === 'proveedor') {
        await client.query(
          `INSERT INTO perfiles_proveedor (usuario_id, telefono)
           VALUES ($1, $2)`,
          [registeredUser.id, telefono]
        );
      }

      return registeredUser;
    });

    return res.status(201).json({
      mensaje: 'Registro exitoso. Inicia sesión para continuar.',
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'usuarios_email_unique_idx') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
    }
    if (error.code === '23505' && error.constraint === 'usuarios_telefono_unique_idx') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese número de teléfono.' });
    }
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ error: 'No fue posible completar el registro.' });
  }
};

const iniciarSesion = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const { password, rol } = req.body;

  if (!email || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
  }
  if (!['cliente', 'proveedor'].includes(rol)) {
    return res.status(400).json({ error: 'Selecciona si inicias sesión como cliente o proveedor.' });
  }

  try {
    const result = await db.query(
      `SELECT id, nombre, email, password_hash, rol, estatus
       FROM usuarios
       WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (
      !user ||
      user.estatus !== 'activo' ||
      user.rol !== rol ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({ error: 'Correo, contraseña o tipo de cuenta incorrectos.' });
    }

    return res.status(200).json({
      token: crearToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'No fue posible iniciar sesión.' });
  }
};

module.exports = { registrar, iniciarSesion };
