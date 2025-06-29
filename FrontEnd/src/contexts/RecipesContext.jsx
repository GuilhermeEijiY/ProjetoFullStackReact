import { createContext, useReducer, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; 

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
    const { authState } = useContext(AuthContext); 

    const API_BASE_URL = 'http://localhost:8080/api';;

    const fetchRecipes = async (query = '') => {
        dispatch({ type: ACTIONS.SET_QUERY, payload: query }); 
        dispatch({ type: ACTIONS.LOADING }); 

        if (!authState.isAuthenticated) {
            dispatch({ type: ACTIONS.ERROR, payload: 'Você precisa estar logado para buscar receitas.' });
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/recipes?s=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${authState.token}`, 
                },
            });
            const data = await res.json();

            if (res.ok) { 
                if (Array.isArray(data)) {
                    dispatch({ type: ACTIONS.SUCCESS, payload: data });
                } else if (data && data.message) {
                    dispatch({ type: ACTIONS.ERROR, payload: data.message });
                } else {
                    dispatch({ type: ACTIONS.ERROR, payload: 'Formato de resposta inesperado do servidor.' });
                }
            } else {
                // Lida com erros do backend (ex: 401, 403, 500)
                const errorMessage = data.message || data.errors?.[0]?.msg || `Erro ${res.status}: ${res.statusText}`;
                dispatch({ type: ACTIONS.ERROR, payload: errorMessage });
            }
        } catch (err) {
            dispatch({ type: ACTIONS.ERROR, payload: 'Erro de conexão com o servidor.' }); // Erro na requisição (rede, etc.)
            console.error('Error fetching recipes:', err);
        }
    };

    // Efeito que busca receitas populares na montagem do app, SE JÁ ESTIVER AUTENTICADO
    useEffect(() => {
        if (authState.isAuthenticated) {
            fetchRecipes(); 
        }
    }, [authState.isAuthenticated]); 

    return (
        <RecipesContext.Provider value={{ state, fetchRecipes }}>
            {children}
        </RecipesContext.Provider>
    );
}