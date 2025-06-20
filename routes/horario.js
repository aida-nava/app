const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');

// Obtener horario por grupo
router.get('/:idGrupo', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idGrupo', sql.VarChar, req.params.idGrupo)
      .query(`
        SELECT 
          H.idHGM,
          H.idClase,
          M.Nombre AS materia,
          D.Nombre AS docente,
          H.dia,
          FORMAT(H.inicio, 'hh\\:mm') AS inicio,
          FORMAT(H.fin, 'hh\\:mm') AS fin,
          C.aula
        FROM HGM H
        JOIN Clases C ON H.idClase = C.idClase
        JOIN Materia M ON C.idMateria = M.idMateria
        JOIN Docentes D ON C.idDocente = D.idDocente
        WHERE C.idGrupo = @idGrupo
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
 
// Obtener todos los horarios
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        H.idHGM,
        H.idClase,
        M.Nombre AS materia,
        D.Nombre AS docente,
        C.idGrupo,
        H.dia,
        FORMAT(H.inicio, 'hh\\:mm') AS inicio,
        FORMAT(H.fin, 'hh\\:mm') AS fin,
        C.aula
      FROM HGM H
      JOIN Clases C ON H.idClase = C.idClase
      JOIN Materia M ON C.idMateria = M.idMateria
      JOIN Docentes D ON C.idDocente = D.idDocente
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
    console.error('Error al obtener todos los horarios:', err);
    res.status(500).send('Error del servidor');
  }
});

// Crear horario
router.post('/', async (req, res) => {
  try {
    const { idClase, dia, inicio, fin } = req.body;
    const pool = await poolPromise;
    await pool.request()
       request.input('idHGM', sql.Int, idHGM); // Aquí lo mandas tú manual
       request.input('dia', sql.VarChar, dia);
       request.input('inicio', sql.Time, inicio); // Debe ser 'HH:mm:ss'
      request.input('fin', sql.Time, fin);
        request.input('idClase', sql.Int, idClase);

    await request.query(`
      INSERT INTO HGM (idHGM, dia, inicio, fin, idClase)
      VALUES (@idHGM, @dia, @inicio, @fin, @idClase)
    `);

    res.status(201).json({ message: 'Horario agregado correctamente' });
  } catch (err) {
    console.error('Error al crear horario:', err);
    res.status(500).send('Error del servidor');
  }
});

// Actualizar horario
router.put('/:idHorario', async (req, res) => {
  try {
    const { dia, inicio, fin } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('idHorario', sql.Int, req.params.idHorario)
      .input('dia', sql.VarChar, dia)
      .input('inicio', sql.Time, inicio)
      .input('fin', sql.Time, fin)
      .query(`
        UPDATE HGM
        SET dia = @dia, inicio = @inicio, fin = @fin
        WHERE idHGM = @idHorario
      `);

    res.send('Horario actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar horario:', err);
    res.status(500).send('Error del servidor');
  }
});

// Eliminar horario
router.delete('/:idHorario', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idHorario', sql.Int, req.params.idHorario)
      .query(`DELETE FROM HGM WHERE idHGM = @idHorario`);

    res.send('Horario eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar horario:', err);
    res.status(500).send('Error del servidor');
  }
});

router.get('/s/:idHorario', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idHorario', sql.Int, req.params.idHorario)
      .query(`
        SELECT 
          H.idHGM,
          H.idClase,
          M.Nombre AS materia,
          D.Nombre AS docente,
          H.dia,
          H.inicio,
          h.fin,
          C.aula,
          C.idGrupo
        FROM HGM H
        JOIN Clases C ON H.idClase = C.idClase
        JOIN Materia M ON C.idMateria = M.idMateria
        JOIN Docentes D ON C.idDocente = D.idDocente
        WHERE H.idHGM = @idHorario
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener horario por idHorario:', err);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
