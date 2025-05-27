// rutas/horario.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');

router.get('/:idGrupo', async (req, res) => {
  const idGrupo = req.params.idGrupo;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idGrupo', sql.VarChar, idGrupo)
      .query(`
        SELECT 
          M.Nombre AS materia,
          D.Nombre AS docente,
          H.dia,
          FORMAT(H.inicio, 'hh\\:mm') AS inicio,
          FORMAT(H.fin, 'hh\\:mm') AS fin,
          H.aula
        FROM HGM H
        JOIN Materia M ON H.idMateria = M.idMateria
        JOIN Docentes D ON H.idDocente = D.idDocente
        WHERE H.idGrupo = @idGrupo
        ORDER BY 
          CASE H.dia 
            WHEN 'Lunes' THEN 1 
            WHEN 'Martes' THEN 2 
            WHEN 'Miércoles' THEN 3 
            WHEN 'Jueves' THEN 4 
            WHEN 'Viernes' THEN 5 
            ELSE 6 
          END, H.inicio
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener horario:', err);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
