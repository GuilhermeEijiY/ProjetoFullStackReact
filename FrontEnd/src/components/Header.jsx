import { useContext } from 'react';
import { Link } from 'react-router-dom'; // Importe Link do react-router-dom
import { AuthContext } from '../contexts/AuthContext'; // Importe AuthContext
import './Header.css'; // Certifique-se de que este arquivo CSS existe e tem os estilos para o header

export default function Header() {
    const { authState, logout } = useContext(AuthContext); // Use useContext para acessar o estado de autenticação e a função logout

    return (
        <header className="header">
            <h1 className="header-title">Busca de Receitas</h1>
            <nav className="header-nav">
                {authState.isAuthenticated ? ( // Mostra links diferentes se o usuário estiver autenticado
                    <>
                        <Link to="/recipes">Buscar</Link> {/* Link para a página de busca */}
                        <Link to="/add-recipe">Adicionar Receita</Link> {/* Link para a página de adicionar receita */}
                        <span className="welcome-user">Olá, {authState.user?.username}!</span> {/* Exibe o nome do usuário */}
                        <button onClick={logout} className="logout-button">Sair</button> {/* Botão de logout */}
                    </>
                ) : ( // Mostra link de login se o usuário NÃO estiver autenticado
                    <Link to="/login">Entrar</Link>
                )}
            </nav>
        </header>
    );
}