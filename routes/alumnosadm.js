const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const multer = require('multer');
// GET alumno por matrícula
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Alumnos');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:matricula', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('matricula', sql.VarChar(10), req.params.matricula)
      .query('SELECT * FROM Alumnos WHERE Matricula = @matricula');
    
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'Alumno no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST dar de alta alumno
router.post('/', async (req, res) => {
  try {
    const { matricula, nombre, email, semestre, estado, adeudo } = req.body;

    if (!matricula || !nombre || !email || !semestre || !estado) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('matricula', sql.VarChar(10), matricula)
      .input('nombre', sql.VarChar(100), nombre)
      .input('email', sql.VarChar(100), email)
      .input('semestre', sql.VarChar(10), semestre)
      .input('estado', sql.VarChar(20), estado)
      .input('adeudo', sql.VarChar(100), adeudo || '')
      .query(`
        INSERT INTO Alumnos (Matricula, nombre, email, semestre, estado, Adeudo)
        VALUES (@matricula, @nombre, @email, @semestre, @estado, @adeudo)
      `);

    res.status(201).json({ message: 'Alumno dado de alta correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PUT modificar alumno
router.put('/:matricula', async (req, res) => {
  try {
    const { nombre, email, adeudo, semestre, estado } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('matricula', sql.VarChar(10), req.params.matricula)
      .input('nombre', sql.VarChar(100), nombre)
      .input('email', sql.VarChar(100), email)
       .input('semestre', sql.VarChar(50), semestre)
        .input('estado', sql.VarChar(50), estado)
       .input('adeudo', sql.VarChar(100), adeudo)
       .query(`
        UPDATE Alumnos 
        SET 
          matricula = @matricula,
          nombre = @nombre, 
          email = @email, 
          semestre = @semestre, 
          estado = @estado, 
          Adeudo = @adeudo 
        WHERE Matricula = @matricula
      `);
    res.json({ message: 'Alumno actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE dar de baja alumno
router.delete('/:matricula', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('matricula', sql.VarChar(10), req.params.matricula)
      .query('DELETE FROM Alumnos WHERE Matricula = @matricula');

    res.json({ message: 'Alumno dado de baja' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/info/:matricula', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('matricula', sql.VarChar(10), req.params.matricula)
      .query(`
        SELECT 
          A.Matricula,
          A.Nombre,
          A.email,
          I.Telefono,
          I.Calle,
          I.Municipio,
          I.Ciudad,
          I.CP,
          I.TelefonoTutor,
          I.NivelIngles
        FROM Alumnos A
        LEFT JOIN InfoAlumno I ON A.Matricula = I.Matricula
        WHERE A.Matricula = @matricula
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'Alumno no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/info/:matricula', async (req, res) => {
  try {
    const {
      nombre,
      email,
      adeudo,
      semestre,
      estado,
      telefono,
      calle,
      municipio,
      ciudad,
      cp,
      telefonoTutor,
      nivelIngles
    } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input('matricula', sql.VarChar(10), req.params.matricula)
      .input('nombre', sql.VarChar(100), nombre)
      .input('email', sql.VarChar(100), email)
      .input('semestre', sql.VarChar(50), semestre)
      .input('estado', sql.VarChar(50), estado)
      .input('adeudo', sql.VarChar(100), adeudo)
      .input('telefono', sql.VarChar(15), telefono)
      .input('calle', sql.VarChar(100), calle)
      .input('municipio', sql.VarChar(50), municipio)
      .input('ciudad', sql.VarChar(50), ciudad)
      .input('cp', sql.VarChar(10), cp)
      .input('telefonoTutor', sql.VarChar(15), telefonoTutor)
      .input('nivelIngles', sql.VarChar(30), nivelIngles)
      .query(`
        BEGIN
          UPDATE Alumnos 
          SET 
            nombre = @nombre, 
            email = @email, 
            semestre = @semestre, 
            estado = @estado, 
            Adeudo = @adeudo 
          WHERE Matricula = @matricula;

          UPDATE InfoAlumno
          SET 
            Telefono = @telefono,
            Calle = @calle,
            Municipio = @municipio,
            Ciudad = @ciudad,
            CP = @cp,
            TelefonoTutor = @telefonoTutor,
            NivelIngles = @nivelIngles
          WHERE Matricula = @matricula;
        END
      `);

    res.json({ message: 'Alumno y datos adicionales actualizados correctamente' });

  } catch (err) {
    console.error('Error al actualizar:', err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
