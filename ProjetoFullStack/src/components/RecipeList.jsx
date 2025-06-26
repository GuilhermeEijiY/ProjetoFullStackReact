import { useContext } from 'react';
import { RecipesContext } from '../contexts/RecipesContext';
import './RecipeList.css';

// Caminho para imagem local padrão (em public/)
const DEFAULT_IMAGE_URL = '/sem-imagem.png';

// Função auxiliar para validar URLs
function isValidUrl(url) {
    try {
        if (!url || typeof url !== 'string') return false;
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

export default function RecipeList() {
    const { state } = useContext(RecipesContext);

    if (state.loading) return <p>Carregando...</p>;
    if (state.error) return <p className="error-message">{state.error}</p>;

    if (!state.loading && !state.error && state.recipes.length === 0) {
        return <p>Nenhuma receita encontrada. Tente outra busca ou adicione uma nova receita!</p>;
    }

    return (
        <div>
            {!state.query && <h2 className="popular">Receitas (Populares ou Recentes)</h2>}
            <div className="recipe-list">
                {state.recipes.map((recipe) => (
                    <div
                        className="recipe-card"
                        key={String(recipe.id || recipe.externalId || Math.random())}
                    >
                        <img
                            src={isValidUrl(recipe.imageUrl) ? recipe.imageUrl : DEFAULT_IMAGE_URL}
                            alt={recipe.name}
                            crossOrigin="anonymous"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_IMAGE_URL;
                            }}
                        />
                        <h3 className="recipe-title">{recipe.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
