const express = require('express');
const bodyParser = require('body-parser'); // Pode ser substituído por express.json()
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();
const routes = require('./src/routes');
const { setupDatabase } = require('./src/config/db');
const mongoose = require('./src/config/db');
const { createUser } = require('./src/models/User');
const path = require('path'); // <<< ADICIONE ESTA LINHA


const app = express();
const PORT = process.env.PORT || 8080; // Use 8080 conforme seu .env

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(compression());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api', routes);

// Middleware para tratamento de erros 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Rota não encontrada.' });
});

// Middleware de tratamento de erros geral (erro 500)
app.use((err, req, res, next) => {
    console.error('Erro geral do servidor:', err.stack);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.', error: err.message });
});

// Conexão com o banco de dados e iniciar o servidor
setupDatabase()
    .then(async () => {
        try {
            const adminExists = await mongoose.model('User').findOne({ username: 'admin' });
            if (!adminExists) {
                await createUser('admin', 'admin123');
                console.log('Usuário admin criado.');
            } else {
                console.log('Usuário admin já existe.');
            }

            const userExists = await mongoose.model('User').findOne({ username: 'user' });
            if (!userExists) {
                await createUser('user', 'user123');
                console.log('Usuário user criado.');
            } else {
                console.log('Usuário user já existe.');
            }
        } catch (err) {
            if (err.code !== 11000) {
                console.error("Erro ao criar usuários iniciais:", err);
            }
        }

        app.listen(PORT, () => {
            console.log(`Servidor Express rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}/api/`);
        });
    })
    .catch(error => {
        console.error('Falha ao iniciar o servidor devido a erro no banco de dados:', error);
        process.exit(1);
    });