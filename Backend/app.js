const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression'); 
require('dotenv').config(); 

const routes = require('./src/routes'); 
const { setupDatabase } = require('./src/config/db'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:3001', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(compression()); 

// Rotas
app.use('/api', routes); 

app.use((req, res, next) => {
    res.status(404).json({ message: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
    console.error('Erro geral do servidor:', err.stack);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.', error: err.message });
});

setupDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor Express rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}/api/`);
        });
    })
    .catch(error => {
        console.error('Falha ao iniciar o servidor devido a erro no banco de dados:', error);
        process.exit(1);
    });