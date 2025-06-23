const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const { body, query, validationResult } = require('express-validator'); 

const { loginUser } = require('../models/User');
const { searchRecipes, addRecipe } = require('../models/Recipe'); 

const JWT_SECRET = process.env.JWT_SECRET || 'sua_super_secreta_jwt_key';
const TOKEN_EXPIRATION = '1h'; 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        console.warn('Tentativa de acesso não autorizado: Token não fornecido.');
        return res.status(401).json({ message: 'Não autorizado: Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.warn(`Tentativa de acesso não autorizado: Token inválido ou expirado - ${err.message}`);
            return res.status(403).json({ message: 'Não autorizado: Token inválido ou expirado.' });
        }
        req.user = user; 
        next();
    });
};

const logRequest = (action, details) => {
    console.log(`[LOG] ${new Date().toISOString()} - Ação: ${action}, Detalhes: ${JSON.stringify(details)}`);

};

router.post('/login',
    body('username').trim().notEmpty().withMessage('Nome de usuário é obrigatório.').escape(),
    body('password').notEmpty().withMessage('Senha é obrigatória.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logRequest('Login Falhou - Validação', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            const user = await loginUser(username, password); 

            if (user) {
                const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
                logRequest('Login Bem-Sucedido', { username: user.username });
                return res.json({ message: 'Login bem-sucedido!', token, user: { id: user.id, username: user.username } });
            } else {
                logRequest('Login Falhou - Credenciais Inválidas', { username });
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }
        } catch (error) {
            logRequest('Login Falhou - Erro Interno', { username, error: error.message });
            console.error('Erro no login:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
);

router.get('/recipes',
    authenticateToken,
    query('s').optional().trim().escape(), 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logRequest('Busca de Receitas Falhou - Validação', { errors: errors.array(), user: req.user?.username });
            return res.status(400).json({ errors: errors.array() });
        }

        const { s } = req.query; 
        try {
            const recipes = await searchRecipes(s);
            logRequest('Busca de Receitas Bem-Sucedida', { query: s, user: req.user?.username, count: recipes.length });
            return res.json(recipes);
        } catch (error) {
            logRequest('Busca de Receitas Falhou - Erro Interno', { query: s, user: req.user?.username, error: error.message });
            console.error('Erro na busca de receitas:', error);
            return res.status(500).json({ message: 'Erro ao buscar receitas.' });
        }
    }
);

router.post('/recipes',
    authenticateToken,
    body('name').trim().notEmpty().withMessage('Nome da receita é obrigatório.').escape(),
    body('ingredients').trim().notEmpty().withMessage('Ingredientes são obrigatórios.').escape(),
    body('instructions').trim().notEmpty().withMessage('Instruções são obrigatórias.').escape(),
    body('imageUrl').optional().trim().isURL().withMessage('URL da imagem inválida.').escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logRequest('Inserção de Receita Falhou - Validação', { errors: errors.array(), user: req.user?.username });
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, ingredients, instructions, imageUrl } = req.body;
        try {
            const newRecipe = await addRecipe({ name, ingredients, instructions, imageUrl });
            logRequest('Inserção de Receita Bem-Sucedida', { recipeName: name, user: req.user?.username });
            return res.status(201).json({ message: 'Receita adicionada com sucesso!', recipe: newRecipe });
        } catch (error) {
            logRequest('Inserção de Receita Falhou - Erro Interno', { recipeName: name, user: req.user?.username, error: error.message });
            console.error('Erro ao adicionar receita:', error);
            return res.status(500).json({ message: 'Erro ao adicionar receita.' });
        }
    }
);

module.exports = router;