const mongoose = require('mongoose');
const cache = require('../config/cache');
const https = require('https');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    externalId: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

async function searchRecipes(query = '') {
    const cacheKey = `recipes_query_${query}`;
    const EXTERNAL_API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/search.php';

    const cachedRecipes = await cache.get(cacheKey);
    if (cachedRecipes) {
        console.log('Receitas recuperadas do cache.');
        return cachedRecipes;
    }

    let externalRecipes = [];
    let internalRecipes = [];

    try {
        const url = `${EXTERNAL_API_BASE_URL}?s=${encodeURIComponent(query)}`;
        const externalApiData = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        console.error('Erro ao parsear JSON da API externa:', e.message);
                        resolve(null);
                    }
                });
            }).on('error', (err) => {
                console.error(`Erro de rede ao chamar API externa: ${err.message}`);
                resolve(null);
            });
        });

        if (externalApiData && externalApiData.meals) {
            externalRecipes = externalApiData.meals.map(meal => ({
                id: meal.idMeal,
                name: meal.strMeal,
                ingredients: Object.keys(meal)
                    .filter(key => key.startsWith('strIngredient') && meal[key])
                    .map(key => meal[key])
                    .filter(Boolean)
                    .join(', '),
                instructions: meal.strInstructions,
                imageUrl: meal.strMealThumb,
                externalId: meal.idMeal
            }));
            console.log(`Receitas recuperadas da API externa: ${externalRecipes.length}`);
        } else {
            console.log('API externa não retornou resultados para a busca ou erro no parsing.');
        }

    } catch (error) {
        console.error('Erro geral ao buscar na API externa:', error.message);
    }

    try {
        console.log('Buscando receitas no banco de dados interno...');
        internalRecipes = await Recipe.find({ name: { $regex: query, $options: 'i' } }).limit(50).lean();
        console.log(`Receitas recuperadas do banco de dados interno: ${internalRecipes.length}`);
    } catch (dbError) {
        console.error('Erro ao buscar receitas no BD interno:', dbError.message);
    }

    const combinedRecipesMap = new Map();

    internalRecipes.forEach(recipe => {
        const key = recipe.externalId || recipe._id.toString();
        combinedRecipesMap.set(key, {
            id: recipe._id.toString(),
            name: recipe.name,
            imageUrl: recipe.imageUrl,
            isInternal: true
        });
    });

    externalRecipes.forEach(recipe => {
        if (!combinedRecipesMap.has(recipe.externalId)) {
            combinedRecipesMap.set(recipe.externalId, {
                id: recipe.id,
                name: recipe.name,
                ingredients: recipe.ingredients, 
                instructions: recipe.instructions, 
                imageUrl: recipe.imageUrl,
                isInternal: false
            });
        }
    });

    const finalRecipes = Array.from(combinedRecipesMap.values());

    if (finalRecipes.length > 0) {
        await cache.set(cacheKey, finalRecipes, 3600);
    }

    return finalRecipes;
}

async function createRecipe(recipeData) {
    try {
        const newRecipe = new Recipe(recipeData);
        const savedRecipe = await newRecipe.save();
        await cache.set(`recipes_query_`, null, 1);

        return savedRecipe.toObject();
    } catch (error) {
        console.error('Erro no model createRecipe:', error);
        throw error;
    }
}

module.exports = { Recipe, searchRecipes, createRecipe };