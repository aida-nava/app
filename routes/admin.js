// routes/admin.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');


// Obtener todos los administradores
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Admin');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});


// Ruta POST para login de administrador
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
    console.log('Login recibido:', correo, contraseña); 
  // Validar que se envíen ambos campos
  if (!correo || !contraseña) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('correo', sql.VarChar, correo)
      .input('contraseña', sql.VarChar, contraseña)
      .query('SELECT * FROM Admin WHERE correo = @correo AND contrasena = @contraseña');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]); // Login correcto
    } else {
      res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

  } catch (error) {
    console.error('Error en el login:', error); // Para depuración
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;
