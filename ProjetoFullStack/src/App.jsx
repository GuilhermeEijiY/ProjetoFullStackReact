import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { RecipesProvider } from './contexts/RecipesContext';
import Header from './components/Header'; 
import Login from './components/Login';
import RecipeList from './components/RecipeList';
import SearchForm from './components/SearchForm';
import AddRecipeForm from './components/AddRecipeForm';
import './App.css';
import { useContext } from 'react';

// Componente para proteger rotas
function PrivateRoute({ children }) {
    const { authState } = useContext(AuthContext);
    return authState.isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <AuthProvider> 
            <Header /> 
            <div className="container">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/recipes"
                        element={
                            <PrivateRoute>
                                <RecipesProvider> 
                                    <SearchForm />
                                    <RecipeList />
                                </RecipesProvider>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/add-recipe"
                        element={
                            <PrivateRoute>
                                <AddRecipeForm />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<InitialRedirect />} />
                    <Route path="*" element={<p>404 - Página Não Encontrada</p>} /> 
                </Routes>
            </div>
        </AuthProvider>
    );
}

// Componente auxiliar para redirecionamento inicial
function InitialRedirect() {
    const { authState } = useContext(AuthContext);
    return authState.isAuthenticated ? <Navigate to="/recipes" replace /> : <Navigate to="/login" replace />;
}

export default App;