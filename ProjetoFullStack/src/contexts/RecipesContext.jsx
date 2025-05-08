import { createContext, useReducer, useEffect } from 'react';

// Ações nomeadas para maior clareza e reutilização
const ACTIONS = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  SET_QUERY: 'SET_QUERY',
};

export const RecipesContext = createContext();

const initialState = {
  recipes: [],
  loading: false,
  error: null,
  query: '',
};

// Reducer mais explícito
function recipesReducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ACTIONS.SUCCESS:
      return {
        ...state,
        loading: false,
        recipes: payload,
      };
    case ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: payload,
      };
    case ACTIONS.SET_QUERY:
      return {
        ...state,
        query: payload,
      };
    default:
      console.warn(`Unhandled action type: ${type}`);
      return state;
  }
}

export function RecipesProvider({ children }) {
  const [state, dispatch] = useReducer(recipesReducer, initialState);

  const fetchRecipes = async (query = '') => {
    dispatch({ type: ACTIONS.SET_QUERY, payload: query });
    dispatch({ type: ACTIONS.LOADING });

    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();

      if (data.meals) {
        dispatch({ type: ACTIONS.SUCCESS, payload: data.meals });
      } else {
        dispatch({ type: ACTIONS.ERROR, payload: 'Nenhuma receita encontrada.' });
      }
    } catch (err) {
      dispatch({ type: ACTIONS.ERROR, payload: 'Erro ao buscar receitas.' });
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <RecipesContext.Provider value={{ state, fetchRecipes }}>
      {children}
    </RecipesContext.Provider>
  );
}
