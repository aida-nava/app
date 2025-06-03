const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db');

router.get('/:idGrupo', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idGrupo', sql.VarChar, req.params.idGrupo)
      .query(`
        SELECT 
  C.idClase,
  M.Nombre AS materia,
  D.Nombre AS docente,
  H.Dia,
  H.inicio,
  H.fin,
  C.aula
FROM HGM H
JOIN Clases C ON H.idClase = C.idClase
JOIN Materia M ON C.idMateria = M.idMateria
JOIN Docentes D ON C.idDocente = D.idDocente
WHERE C.idGrupo = @idGrupo
ORDER BY H.Dia, H.inicio;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /horario/:idGrupo', err);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
