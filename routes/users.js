const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { poolPromise } = require("../db");

// Obtener todos los alumnos
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Alumnos");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Dar de alta un alumno
router.post("/", async (req, res) => {
  const { matricula, nombre, email, adeudo } = req.body;

  if (!matricula || !nombre || !email) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const pool = await poolPromise;

    // Verifica si ya existe
    const check = await pool.request()
      .input("matricula", sql.VarChar, matricula)
      .query("SELECT COUNT(*) AS total FROM Alumnos WHERE Matricula = @matricula");

    if (check.recordset[0].total > 0) {
      return res.status(409).json({ error: "Ya existe un alumno con esa matrícula." });
    }

    await pool.request()
      .input("matricula", sql.VarChar, matricula)
      .input("nombre", sql.NVarChar, nombre)
      .input("email", sql.NVarChar, email)
      .input("adeudo", sql.NVarChar, adeudo || "")
      .query(`
        INSERT INTO Alumnos (Matricula, Nombre, Email, Adeudo)
        VALUES (@matricula, @nombre, @email, @adeudo)
      `);

    res.status(201).json({ message: "Alumno registrado correctamente." });
  } catch (err) {
    console.error("❌ Error al registrar alumno:", err);
    res.status(500).json({ error: "Error al registrar alumno." });
  }
});

module.exports = router;
