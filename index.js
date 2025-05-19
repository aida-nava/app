const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const usersRouter = require("./routes/users");
const uploadRoutes = require('./routes/upload');
app.use('/pdf', uploadRoutes);
app.use("/users", usersRouter);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🚀 ¡Tu API está funcionando correctamente en Railway!');
});

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
