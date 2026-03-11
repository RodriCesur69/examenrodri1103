const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    res.render('index', { usuario: req.session.usuario });
});

router.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === 'admin' && password === '1234') {
        req.session.usuario = usuario;
    }
    res.redirect('/');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.get('/api/monumentos', (req, res) => {
    const rutaJson = path.join(__dirname, '../data/monumentos.geojson');
    const contenido = fs.readFileSync(rutaJson, 'utf-8');
    res.json(JSON.parse(contenido));
});

module.exports = router;