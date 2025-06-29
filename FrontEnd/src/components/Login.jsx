import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Crie este CSS se necessário

const loginSchema = yup.object({
    username: yup.string().trim().required('O nome de usuário é obrigatório.'),
    password: yup.string().required('A senha é obrigatória.'),
});

export default function Login() {
    const { authState, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError, // Para definir erros de forma manual
    } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: { username: '', password: '' },
    });

    useEffect(() => {
        // Se já estiver autenticado, redireciona para receitas
        if (authState.isAuthenticated) {
            navigate('/recipes');
        }
    }, [authState.isAuthenticated, navigate]);

    // Observa o erro do contexto e o define no formulário
    useEffect(() => {
        if (authState.error) {
            setError('serverError', { message: authState.error });
        }
    }, [authState.error, setError]);


    const onSubmit = async ({ username, password }) => {
        await login(username, password);
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                <h2>Login</h2>
                <div className="form-group">
                    <label htmlFor="username">Nome de Usuário:</label>
                    <input
                        type="text"
                        id="username"
                        {...register('username')}
                        aria-invalid={errors.username ? 'true' : 'false'}
                    />
                    <p className="error-message">{errors.username?.message}</p>
                </div>
                <div className="form-group">
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        {...register('password')}
                        aria-invalid={errors.password ? 'true' : 'false'}
                    />
                    <p className="error-message">{errors.password?.message}</p>
                </div>
                <button type="submit" disabled={isSubmitting || authState.loading}>
                    {authState.loading ? 'Entrando...' : 'Entrar'}
                </button>
                {errors.serverError && (
                    <p className="error-message server-error">{errors.serverError.message}</p>
                )}
            </form>
        </div>
    );
}