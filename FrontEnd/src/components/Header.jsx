import { useContext } from 'react';
import { Link } from 'react-router-dom'; 
import { AuthContext } from '../contexts/AuthContext'; 
import './Header.css'; 

export default function Header() {
    const { authState, logout } = useContext(AuthContext); 

    return (
        <header className="header">
            <h1 className="header-title">Busca de Receitas</h1>
            <nav className="header-nav">
                {authState.isAuthenticated ? ( 
                    <>
                        <Link to="/recipes">Buscar</Link> 
                        <Link to="/add-recipe">Adicionar Receita</Link> 
                        <span className="welcome-user">Olá, {authState.user?.username}!</span> 
                        <button onClick={logout} className="logout-button">Sair</button> 
                    </>
                ) : ( // Mostra link de login se o usuário NÃO estiver autenticado
                    <Link to="/login">Entrar</Link>
                )}
            </nav>
        </header>
    );
}