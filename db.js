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
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Conectado a SQL Azure");
    return pool;
  })
  .catch(err => console.error("❌ Error de conexión:", err));

module.exports = {
  sql,
  poolPromise,
};
