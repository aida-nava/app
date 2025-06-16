const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require("../db");
const multer = require('multer');

// Multer para manejar archivos PDF en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ POST /pdf → Guarda PDF en la base de datos
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const { matricula } = req.body;
    if (!matricula || !req.file) {
      return res.status(400).json({ error: 'Faltan datos: matrícula o archivo.' });
    }

    const pool = await poolPromise;

    const check = await pool.request()
      .input('matricula', sql.VarChar, matricula)
      .query('SELECT COUNT(*) as total FROM PdfFiles WHERE Matricula = @matricula');

    if (check.recordset[0].total > 0) {
      return res.status(409).json({ error: 'Ya existe un PDF para esta matrícula.' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    await pool.request()
      .input('matricula', sql.VarChar, matricula)
      .input('fileName', sql.NVarChar, fileName)
      .input('fileData', sql.VarBinary(sql.MAX), fileBuffer)
      .query(`
        INSERT INTO PdfFiles (Matricula, FileName, FileData)
        VALUES (@matricula, @fileName, @fileData)
      `);

    res.status(200).json({ message: 'PDF y matrícula guardados correctamente.' });
  } catch (err) {
    console.error('❌ Error al subir PDF:', err);
    res.status(500).json({ error: 'Error al guardar en la base de datos.' });
  }
});

// ✅ GET /pdf/:matricula → Verifica si ya existe PDF para esa matrícula
router.get('/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('matricula', sql.VarChar, matricula)
      .query('SELECT Id FROM PdfFiles WHERE Matricula = @matricula');

    if (result.recordset.length > 0) {
      res.status(200).json({ message: 'PDF ya existe para esta matrícula.' });
    } else {
      res.status(404).json({ message: 'No se encontró PDF para esta matrícula.' });
    }
  } catch (err) {
    console.error('❌ Error al verificar PDF:', err);
    res.status(500).json({ error: 'Error al verificar existencia del PDF.' });
  }
});

// ✅ GET /pdf → Lista de todos los PDFs
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id, Matricula, FileName, UploadDate FROM PdfFiles ORDER BY UploadDate DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al listar PDFs:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /pdf/url/:matricula → Redirige directamente a la vista del PDF
router.get('/view/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('matricula', sql.VarChar, matricula)
      .query('SELECT FileName, FileData FROM PdfFiles WHERE Matricula = @matricula');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No se encontró el PDF.' });
    }

    const pdf = result.recordset[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.FileName}"`);
    res.send(pdf.FileData);
  } catch (err) {
    console.error('❌ Error al ver PDF:', err);
    res.status(500).json({ error: 'Error al obtener el PDF.' });
  }
});
module.exports = router;