import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AddRecipeForm.css'; 

const addRecipeSchema = yup.object({
    name: yup.string().trim().required('O nome da receita é obrigatório.'),
    ingredients: yup.string().trim().required('Os ingredientes são obrigatórios.'),
    instructions: yup.string().trim().required('As instruções são obrigatórias.'),
    imageUrl: yup.string().url('URL da imagem inválida.').optional().nullable(true),
});

export default function AddRecipeForm() {
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const [submitMessage, setSubmitMessage] = useState(null); 

    const API_BASE_URL = 'http://localhost:8080/api';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
    } = useForm({
        resolver: yupResolver(addRecipeSchema),
        defaultValues: { name: '', ingredients: '', instructions: '', imageUrl: '' },
    });

    const onSubmit = async (data) => {
        setSubmitMessage(null); // Limpa mensagens anteriores
        try {
            const response = await fetch(`${API_BASE_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`, // Envia o token
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitMessage({ type: 'success', text: result.message || 'Receita adicionada com sucesso!' });
                reset(); // Limpa o formulário
                // Opcional: navegar para a lista de receitas após a inserção
                // navigate('/recipes');
            } else {
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(err => {
                        if (err.path) { // Se o erro vier com o caminho do campo
                            setError(err.path, { message: err.msg });
                        } else {
                            // Erros gerais que não se associam a um campo específico
                            setSubmitMessage({ type: 'error', text: err.msg || 'Erro na validação do formulário.' });
                        }
                    });
                } else {
                    setSubmitMessage({ type: 'error', text: result.message || 'Erro ao adicionar receita.' });
                }
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'Erro de conexão ou servidor ao adicionar receita.' });
            console.error('Erro ao adicionar receita:', error);
        }
    };

    return (
        <div className="add-recipe-container">
            <form onSubmit={handleSubmit(onSubmit)} className="add-recipe-form">
                <h2>Adicionar Nova Receita</h2>
                {submitMessage && (
                    <p className={`submit-message ${submitMessage.type}`}>
                        {submitMessage.text}
                    </p>
                )}
                <div className="form-group">
                    <label htmlFor="name">Nome da Receita:</label>
                    <input type="text" id="name" {...register('name')} />
                    <p className="error-message">{errors.name?.message}</p>
                </div>
                <div className="form-group">
                    <label htmlFor="ingredients">Ingredientes:</label>
                    <textarea id="ingredients" {...register('ingredients')}></textarea>
                    <p className="error-message">{errors.ingredients?.message}</p>
                </div>
                <div className="form-group">
                    <label htmlFor="instructions">Instruções:</label>
                    <textarea id="instructions" {...register('instructions')}></textarea>
                    <p className="error-message">{errors.instructions?.message}</p>
                </div>
                <div className="form-group">
                    <label htmlFor="imageUrl">URL da Imagem (opcional):</label>
                    <input type="text" id="imageUrl" {...register('imageUrl')} />
                    <p className="error-message">{errors.imageUrl?.message}</p>
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Receita'}
                </button>
            </form>
        </div>
    );
}