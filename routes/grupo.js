const express = require('express');
const router = express.Router();
const { poolPromise } = require("../db"); // Importas poolPromise

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise; // Usas poolPromise directamente
    const result = await pool.request().query('SELECT * FROM Grupo');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /grupos:', err);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;

