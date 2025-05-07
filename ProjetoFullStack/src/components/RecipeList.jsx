import { useContext } from 'react';
import { RecipesContext } from '../contexts/RecipesContext';
import './RecipeList.css';

export default function RecipeList() {
  const { state } = useContext(RecipesContext);
  console.log(state); 

  if (state.loading) return <p>Carregando...</p>;
  if (state.error) return <p>{state.error}</p>;

  return (
    <div>
      {!state.query && <h2 className="popular">Mais Populares</h2>}
      <div className="recipe-list">
        {state.recipes.map((recipe) => (
          <div className="recipe-card" key={recipe.idMeal}>
            <img src={recipe.strMealThumb} alt={recipe.strMeal} />
            <h3 className="recipe-title">{recipe.strMeal}</h3>
          </div>
        ))}
      </div>
    </div>  
  );
}
