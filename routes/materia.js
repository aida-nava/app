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

router.post('/', async (req, res) => {
  try {
    const { idMateria, idDocente, idGrupo, aula } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('idMateria', sql.Int, idMateria)
      .input('idDocente', sql.Int, idDocente)
      .input('idGrupo', sql.VarChar, idGrupo)
      .input('aula', sql.VarChar, aula)
      .query(`
        INSERT INTO Clases (idMateria, idDocente, idGrupo, aula)
        VALUES (@idMateria, @idDocente, @idGrupo, @aula);

        SELECT SCOPE_IDENTITY() AS idClase;
      `);

    res.status(201).json({ idClase: result.recordset[0].idClase });
  } catch (err) {
    console.error('Error al dar de alta clase', err);
    res.status(500).send('Error del servidor');
  }
});

// Obtener una clase por idClase
router.get('/clases/:idClase', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idClase', sql.Int, req.params.idClase)
      .query(`
        SELECT 
          C.idClase,
          M.Nombre AS nombre,
          C.idGrupo AS grupo,
          D.Nombre AS profesor
        FROM Clases C
        JOIN Materia M ON C.idMateria = M.idMateria
        JOIN Docentes D ON C.idDocente = D.idDocente
        WHERE C.idClase = @idClase
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ Error en GET /clases/clase/:idClase', err);
    res.status(500).json({ error: 'Error al buscar la clase' });
  }
});


router.put('/:idClase', async (req, res) => {
  try {
    const { idMateria, idDocente, aula } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('idClase', sql.Int, req.params.idClase)
      .input('idMateria', sql.Int, idMateria)
      .input('idDocente', sql.Int, idDocente)
      .input('aula', sql.VarChar, aula)
      .query(`
        UPDATE Clases
        SET idMateria = @idMateria,
            idDocente = @idDocente,
            aula = @aula
        WHERE idClase = @idClase;
      `);

    res.send('Clase modificada correctamente');
  } catch (err) {
    console.error('Error al modificar clase', err);
    res.status(500).send('Error del servidor');
  }
});

// DELETE /clases/:idClase
router.delete('/:idClase', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idClase', sql.Int, req.params.idClase)
      .query('DELETE FROM Clases WHERE idClase = @idClase');

    res.send('Clase eliminada correctamente');
  } catch (err) {
    console.error('Error al eliminar clase', err);
    res.status(500).send('Error del servidor');
  }
});
module.exports = router;
