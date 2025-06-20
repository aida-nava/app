const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db');
const connection = require('../db')

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



router.post('/', async (req, res) => {
  try {
    const { idClase, idMateria, idDocente, idgrupo, aula } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('idClase', sql.Int, idClase)
      .input('idMateria', sql.VarChar, idMateria)
      .input('idDocente', sql.VarChar, idDocente)
      .input('idgrupo', sql.Int, idgrupo)
      .input('aula', sql.VarChar, aula)
      .query(`
        INSERT INTO Clases (idClase, idMateria, idDocente, idgrupo, aula)
        VALUES (@idClase, @idMateria, @idDocente, @idgrupo, @aula);
      `);

    res.status(201).json({ mensaje: 'Clase registrada exitosamente' });
  } catch (err) {
    console.error('Error al dar de alta clase', err);
    res.status(500).send('Error del servidor');
    app.use(express.json());
  }
});


router.put('/:idClase', async (req, res) => {
  try {
    const idClase = req.params.idClase; 
    const { idMateria, idDocente, idGrupo, aula } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('idClase', sql.Int, idClase)
      .input('idMateria', sql.VarChar, idMateria)
      .input('idDocente', sql.VarChar, idDocente)
      .input('idgrupo', sql.Int, idGrupo)
      .input('aula', sql.VarChar, aula)
      .query(`
        UPDATE clases
        SET idMateria = @idMateria,
            idDocente = @idDocente,
            idgrupo = @idgrupo,
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

router.get('/nombres/:nombre', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('nombre', sql.VarChar, req.params.nombre)
      .query('SELECT TOP 1 idMateria FROM Materia WHERE Nombre = @nombre');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al buscar materia por nombre:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/docentes/nombre/:nombre', async (req, res) => {
  const nombreDocente = req.params.nombre;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('nombre', sql.VarChar, nombreDocente)
      .query('SELECT TOP 1 idDocente FROM Docentes WHERE Nombre = @nombre');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    res.json(result.recordset[0]); // { idDocente: 'DOC02' }
  } catch (err) {
    console.error('❌ Error al buscar docente por nombre:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


module.exports = router;
