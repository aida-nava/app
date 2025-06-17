const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const usersRouter = require("./routes/users");
const uploadRoutes = require('./routes/upload');
const gruposRoutes = require('./routes/grupo');
const horarioRoutes = require('./routes/horario');
const materiasRoutes = require('./routes/materia');
const inscripcionRoutes = require('./routes/inscripcion');
const alumnoRoutes = require('./routes/alumnosadm');
const adminRoutes = require('./routes/admin');


app.use('/pdf', uploadRoutes);
app.use("/users", usersRouter);
app.use('/grupos', gruposRoutes);
app.use('/horario', horarioRoutes);
app.use('/materias', materiasRoutes);
app.use('/inscripciones', inscripcionRoutes);
app.use('/alumnos', alumnoRoutes);
app.use('/admin', adminRoutes); 


const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🚀 ¡Tu API está funcionando correctamente en Railway!');
});

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
