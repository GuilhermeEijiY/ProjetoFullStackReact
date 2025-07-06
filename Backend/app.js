const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const https = require('https');
require('dotenv').config();
const routes = require('./src/routes');
const { setupDatabase } = require('./src/config/db');
const mongoose = require('./src/config/db');
const { createUser } = require('./src/models/User');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8443;

// HTTPS credenciais
const credentials = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
};

// Helmet para segurança HTTP headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições. Tente novamente mais tarde.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers e compressão
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

// Arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api', routes);

// Middleware para rota não encontrada
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// Middleware de erro geral
app.use((err, req, res, next) => {
  console.error('Erro geral do servidor:', err.stack);
  res.status(500).json({ message: 'Erro interno do servidor.', error: err.message });
});

// Conectar ao banco e iniciar servidor HTTPS
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
        console.error('Erro ao criar usuários iniciais:', err);
      }
    }

    https.createServer(credentials, app).listen(PORT, () => {
      console.log(`Servidor HTTPS rodando na porta ${PORT}`);
      console.log(`Acesse: https://localhost:${PORT}/api/`);
    });
  })
  .catch(error => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  });