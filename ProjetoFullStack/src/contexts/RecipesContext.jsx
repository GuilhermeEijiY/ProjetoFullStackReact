import { createContext, useReducer, useEffect } from 'react';

export const RecipesContext = createContext();

const initialState = {
  recipes: [],
  loading: false,
  error: null,
  query: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, recipes: action.payload };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    default:
      return state;
  }
}

export function RecipesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchRecipes = async (query = '') => {
    dispatch({ type: 'SET_QUERY', payload: query });
    dispatch({ type: 'LOADING' });
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();
      if (data.meals) {
        dispatch({ type: 'SUCCESS', payload: data.meals });
      } else {
        dispatch({ type: 'ERROR', payload: 'Nenhuma receita encontrada.' });
      }
    } catch (err) {
      dispatch({ type: 'ERROR', payload: 'Erro ao buscar receitas.' });
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
