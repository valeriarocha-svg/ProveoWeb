const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión.' });
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está configurada.');
    return res.status(500).json({ error: 'La autenticación no está configurada en el servidor.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.sub || !payload.rol) {
      return res.status(401).json({ error: 'El token de sesión no es válido.' });
    }
    req.user = { id: payload.sub, rol: payload.rol };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'La sesión no es válida o ha expirado.' });
  }
};
