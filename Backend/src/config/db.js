const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipes_app';

async function setupDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10 // Pool de conexões
    });
    console.log('Conectado ao banco de dados MongoDB com Mongoose!');
  } catch (error) {
    console.error('Erro ao conectar ou inicializar o banco:', error);
    process.exit(1);
  }
}

module.exports = mongoose;
module.exports.setupDatabase = setupDatabase;