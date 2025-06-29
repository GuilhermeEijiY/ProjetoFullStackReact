const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipes_app';

async function setupDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado ao banco de dados MongoDB com Mongoose!');

       //await createUser('admin', 'senha_admin_aqui'); // A senha será hashada
       //await createUser('user', 'senha_user_aqui');
    } catch (error) {
        console.error('Erro ao conectar ou inicializar o banco de dados MongoDB:', error);
        process.exit(1); // Encerrar a aplicação se não conseguir conectar
    }
}

module.exports = mongoose; 
module.exports.setupDatabase = setupDatabase; 