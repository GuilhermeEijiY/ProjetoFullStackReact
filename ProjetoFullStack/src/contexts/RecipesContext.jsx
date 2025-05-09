import { createContext, useReducer, useEffect } from 'react';

// Constante para padronizar os tipos de ação
const ACTIONS = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  SET_QUERY: 'SET_QUERY',
};

// Criação do contexto
export const RecipesContext = createContext();

// Estado inicial do reducer
const initialState = {
  recipes: [],
  loading: false,
  error: null,
  query: '',
};

// Função reducer para gerenciar os estados com base em ações
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

// Componente Provider que disponibiliza o estado e funções para toda a aplicação
export function RecipesProvider({ children }) {
  const [state, dispatch] = useReducer(recipesReducer, initialState);

  // Função que realiza a busca de receitas na API externa
  const fetchRecipes = async (query = '') => {
    dispatch({ type: ACTIONS.SET_QUERY, payload: query }); // Armazena o termo de busca
    dispatch({ type: ACTIONS.LOADING }); // Ativa loading

    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();

      if (data.meals) {
        dispatch({ type: ACTIONS.SUCCESS, payload: data.meals }); // Sucesso: salva as receitas
      } else {
        dispatch({ type: ACTIONS.ERROR, payload: 'Nenhuma receita encontrada.' });
      }
    } catch (err) {
      dispatch({ type: ACTIONS.ERROR, payload: 'Erro ao buscar receitas.' }); // Erro na requisição
    }
  };

  // Efeito que busca receitas populares na montagem do app
  useEffect(() => {
    fetchRecipes(); // Busca inicial sem query
  }, []);

  return (
    <RecipesContext.Provider value={{ state, fetchRecipes }}>
      {children}
    </RecipesContext.Provider>
  );
}
