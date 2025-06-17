const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true, // 🔒 agrega esto si estás en localhost
  },
};

// 💡 Esta es la diferencia: lanzamos el error para que pueda capturarse correctamente en la app
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Conectado a SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Error de conexión con SQL Server:", err);
    throw err; // 💥 Esto es clave para que `await poolPromise` dispare el catch
  });

module.exports = {
  sql,
  poolPromise,
};

