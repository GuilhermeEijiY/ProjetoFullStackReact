import { createContext, useReducer, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 

const AUTH_ACTIONS = {
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
};

export const AuthContext = createContext();

const authInitialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_REQUEST:
            return { ...state, loading: true, error: null };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                error: null,
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, authInitialState);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:8080/api'; 

    const login = async (username, password) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_REQUEST });
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { token: data.token, user: data.user } });
                navigate('/recipes'); 
            } else {
                dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: data.message || data.errors?.[0]?.msg || 'Erro desconhecido no login' });
            }
        } catch (err) {
            dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: 'Erro de conexão ou servidor.' });
            console.error('Login error:', err);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        navigate('/login'); 
    };

    return (
        <AuthContext.Provider value={{ authState: state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}