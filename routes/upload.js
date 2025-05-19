const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require("../db");
const multer = require('multer');

// Multer para manejar archivos PDF en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /pdf
router.post('/', upload.single('pdf'), async (req, res) => {
   res.send('🚀 ¡Tu API está funcionando!');
  try {
    const { matricula } = req.body;
    if (!matricula || !req.file) {
      return res.status(400).json({ error: 'Faltan datos: matrícula o archivo.' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    const pool = await poolPromise;
    const request = pool.request();
    request.input('matricula', sql.VarChar, matricula);
    request.input('fileName', sql.NVarChar, fileName);
    request.input('fileData', sql.VarBinary(sql.MAX), fileBuffer);

    await request.query(`
      INSERT INTO PdfFiles (Matricula, FileName, FileData)
      VALUES (@matricula, @fileName, @fileData)
    `);

    res.status(200).json({ message: 'PDF y matrícula guardados correctamente.' });
  } catch (err) {
    console.error('❌ Error al subir PDF:', err);
    res.status(500).json({ error: 'Error al guardar en la base de datos.' });
  }
});

// GET /pdf
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

module.exports = router;
