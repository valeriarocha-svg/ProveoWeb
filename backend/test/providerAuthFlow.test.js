const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const originalDatabaseUrl = process.env.DATABASE_URL;
const originalJwtSecret = process.env.JWT_SECRET;
process.env.DATABASE_URL ||= 'postgres://test:test@127.0.0.1:5432/proveo_test';
process.env.JWT_SECRET = 'test-provider-auth-flow-secret';

const db = require('../src/db');
const authRoutes = require('../src/routes/authRoutes');

test('registers a provider with a profile and lets that provider log in', async () => {
  const originalQuery = db.query;
  const originalTransaction = db.transaction;
  let user;
  let providerProfile;

  db.query = async (sql, params) => {
    if (sql.includes('email_exists')) {
      return { rows: [{ email_exists: false, telefono_exists: false }] };
    }
    if (sql.includes('FROM usuarios') && params[0] === user.email) {
      return { rows: [{ ...user, estatus: 'activo' }] };
    }
    throw new Error(`Unexpected database query: ${sql}`);
  };

  db.transaction = async (callback) => callback({
    query: async (sql, params) => {
      if (sql.includes('INSERT INTO usuarios')) {
        user = {
          id: 'provider-user-id',
          nombre: params[0],
          email: params[1],
          password_hash: params[3],
          rol: params[4],
        };
        return { rows: [{ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }] };
      }
      if (sql.includes('INSERT INTO perfiles_proveedor')) {
        providerProfile = { usuario_id: params[0], telefono: params[1] };
        return { rows: [] };
      }
      throw new Error(`Unexpected transaction query: ${sql}`);
    },
  });

  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  const server = app.listen(0, '127.0.0.1');

  try {
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/v1/auth`;

    const registrationResponse = await fetch(`${baseUrl}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: '  Proveedor de Prueba  ',
        email: ' PROVEEDOR@example.com ',
        telefono: '55 1234 5678',
        password: 'Proveedor1!',
        rol: 'proveedor',
      }),
    });
    const registration = await registrationResponse.json();

    assert.equal(registrationResponse.status, 201);
    assert.deepEqual(registration.user, {
      id: 'provider-user-id',
      nombre: 'Proveedor de Prueba',
      email: 'proveedor@example.com',
      rol: 'proveedor',
    });
    assert.deepEqual(providerProfile, {
      usuario_id: 'provider-user-id',
      telefono: '+525512345678',
    });
    assert.notEqual(user.password_hash, 'Proveedor1!');
    assert.equal(await bcrypt.compare('Proveedor1!', user.password_hash), true);

    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ' PROVEEDOR@example.com ',
        password: 'Proveedor1!',
        rol: 'proveedor',
      }),
    });
    const login = await loginResponse.json();

    assert.equal(loginResponse.status, 200);
    assert.deepEqual(login.user, registration.user);
    assert.equal(typeof login.token, 'string');
    const tokenPayload = jwt.verify(login.token, process.env.JWT_SECRET);
    assert.equal(tokenPayload.rol, 'proveedor');
    assert.equal(tokenPayload.sub, user.id);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    db.query = originalQuery;
    db.transaction = originalTransaction;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  }
});
