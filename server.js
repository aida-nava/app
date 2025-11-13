
const express = require('express');
const bodyParser = require('body-parser');
const ActiveDirectory = require('activedirectory');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Active Directory
const config = {
    url: 'ldap://tu-dominio.local', // Cambiar por tu servidor LDAP/AD
    baseDN: 'dc=midominio,dc=local', // Cambiar según tu AD
    username: 'usuario-admin@midominio.local', // Usuario con permisos de búsqueda
    password: 'Gmb@#,hdmTI'
};

const ad = new ActiveDirectory(config);

// Servir página de login
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Ruta de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    ad.authenticate(username + '@midominio.local', password, (err, auth) => {
        if (err) {
            console.error('Error de autenticación:', err);
            return res.send('Error en la autenticación');
        }
        if (auth) {
            res.send(`Autenticación exitosa. Bienvenido, ${username}`);
        } else {
            res.send('Usuario o contraseña incorrectos');
        }
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});