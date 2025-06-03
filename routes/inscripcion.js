const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db');

router.post('/', async (req, res) => {
  const { idAlumno, clasesSeleccionadas } = req.body;

  if (!idAlumno || !Array.isArray(clasesSeleccionadas) || clasesSeleccionadas.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    const pool = await poolPromise;

    // Buscar el idBoucher del alumno en PdfFile
    const boucherResult = await pool.request()
      .input('idAlumno', sql.VarChar(20), idAlumno)
      .query('SELECT TOP 1 Id FROM PdfFiles WHERE Matricula = @idAlumno');

    if (boucherResult.recordset.length === 0) {
      return res.status(404).json({ error: 'No se encontró el idBoucher del alumno' });
    }

    const idBoucher = boucherResult.recordset[0].Id;

    // Iterar sobre cada clase seleccionada
    for (const idClase of clasesSeleccionadas) {
      if (!idClase) continue;

      // Obtener todos los idHGM asociados a la clase
      const hgmResult = await pool.request()
        .input('idClase', sql.VarChar(10), String(idClase))
        .query('SELECT idHGM FROM HGM WHERE idClase = @idClase');

      if (hgmResult.recordset.length === 0) {
        console.warn(`No se encontró idHGM para idClase: ${idClase}`);
        continue;
      }

      // Iterar sobre cada idHGM de esa clase
      for (const row of hgmResult.recordset) {
        const idHGM = row.idHGM;
        const idIns = `INS${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

        // Verificar si ya existe esa inscripción
        const existsResult = await pool.request()
          .input('idAlumno', sql.VarChar(20), idAlumno)
          .input('idHGM', sql.VarChar(20), idHGM.toString())
          .query('SELECT 1 FROM Inscripciones WHERE idAlumno = @idAlumno AND idHGM = @idHGM');

        if (existsResult.recordset.length === 0) {
          // Insertar si no existe
          await pool.request()
            .input('idIns', sql.VarChar(10), idIns)
            .input('idAlumno', sql.VarChar(20), idAlumno)
            .input('idHGM', sql.VarChar(20), idHGM.toString())
            .input('idBoucher', sql.Int, idBoucher)
            .query(`
              INSERT INTO Inscripciones (idIns, idAlumno, idHGM, idBoucher)
              VALUES (@idIns, @idAlumno, @idHGM, @idBoucher)
            `);
        } else {
          console.log(`🔁 Ya existe inscripción para alumno ${idAlumno} y HGM ${idHGM}`);
        }
      }
    }

    res.json({ mensaje: 'Inscripciones guardadas correctamente' });
  } catch (error) {
    console.error('Error al guardar inscripciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
