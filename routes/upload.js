// routes/upload.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require("../db");
const multer = require('multer');

// Multer para manejar archivos PDF en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post('/', upload.single('pdf'), async (req, res) => {
   res.send('🚀 ¡Tu API está funcionando correctamente en Railway!');
  try {
    const { matricula } = req.body;
    if (!matricula || !req.file) {
      return res.status(400).json({ error: 'Faltan datos: matrícula o archivo.' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('matricula', sql.VarChar, matricula);
    request.input('fileName', sql.NVarChar, fileName);
    request.input('fileData', sql.VarBinary(sql.MAX), fileBuffer);

    await request.query(`
      INSERT INTO PdfFiles (Matricula, FileName, FileData)
      VALUES (@matricula, @fileName, @fileData)
    `);

    res.status(200).json({ message: 'PDF y matrícula guardados correctamente.' });
  } catch (err) {
  console.error('❌ Error al subir PDF (detalle completo):', err); // esto imprime todo
  res.status(500).json({
    error: err.message || 'Error desconocido',
    stack: err.stack, // puedes eliminar esto luego
  });
}
});

module.exports = router;
