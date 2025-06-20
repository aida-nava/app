const express = require('express');

const sql = require('mssql');

const router = express.Router();
const { poolPromise } = require('../db'); // AQUI el poolPromise de mssql

router.get('/:idDocente/horario', async (req, res) => {
  const { idDocente } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('idDocente', idDocente)
      .query(`
         SELECT 
    m.Nombre AS materia,
    g.Nombre AS grupo,
    c.aula,
    h.dia,
    CONVERT(varchar(5), h.inicio, 108) AS horaInicio,
    CONVERT(varchar(5), h.fin, 108) AS horaFin
FROM HGM h
INNER JOIN clases c ON h.idClase = c.idClase
INNER JOIN Materia m ON c.idMateria = m.idMateria
INNER JOIN Grupo g ON c.idGrupo = g.idGrupo
WHERE c.idDocente = @idDocente
ORDER BY 
    CASE h.dia
        WHEN 'Lunes' THEN 1
        WHEN 'Martes' THEN 2
        WHEN 'Miércoles' THEN 3
        WHEN 'Jueves' THEN 4
        WHEN 'Viernes' THEN 5
        WHEN 'Sábado' THEN 6
        WHEN 'Domingo' THEN 7
        ELSE 8
    END,
    h.inicio
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener el horario del docente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena || typeof correo !== 'string' || typeof contrasena !== 'string') {
    return res.status(400).json({ message: 'Correo o contraseña inválidos.' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT * FROM docentes WHERE Correo = @correo');
        
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Docente no encontrado.' });
    }

    const docente = result.recordset[0];
    console.log('Docente:', docente);


    if (contrasena.trim() !== docente.contrasena.trim()) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    res.status(200).json({
      id: docente.ID,
      nombre: docente.Nombre,
      correo: docente.Correo,
      rol: 'docente'
    });

  } catch (error) {
    console.error('Error al autenticar docente:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

module.exports = router;