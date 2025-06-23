const mongoose = require('mongoose');
const cache = require('../config/cache'); 

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ingredients: {
        type: String, 
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

async function searchRecipes(query = '') {
    const cacheKey = `recipes_query_${query}`;
    const cachedRecipes = await cache.get(cacheKey);
    if (cachedRecipes) {
        console.log('Receitas recuperadas do cache.');
        return cachedRecipes;
    }

    try {
        let recipes;
        if (query) {
            recipes = await Recipe.find({ name: { $regex: query, $options: 'i' } });
        } else {
            recipes = await Recipe.find().limit(20); 
        }

        const recipesPlain = recipes.map(recipe => recipe.toObject());

        await cache.set(cacheKey, recipesPlain, 3600); 
        return recipesPlain;
    } catch (error) {
        console.error('Erro no model searchRecipes:', error);
        throw error;
    }
}

async function addRecipe({ name, ingredients, instructions, imageUrl }) {
    try {
        const newRecipe = new Recipe({ name, ingredients, instructions, imageUrl });
        const savedRecipe = await newRecipe.save();
        await cache.set(`recipes_query_`, null, 1); 

        return savedRecipe.toObject(); 
    } catch (error) {
        console.error('Erro no model addRecipe:', error);
        throw error;
    }
}

module.exports = { Recipe, searchRecipes, addRecipe }; 