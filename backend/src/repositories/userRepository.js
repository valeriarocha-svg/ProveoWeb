const pool = require('../config/db');

async function findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}

async function create({ email, passwordHash, role }) {
    const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, passwordHash, role]
    );
    return result.insertId;
}

module.exports = { findByEmail, create };