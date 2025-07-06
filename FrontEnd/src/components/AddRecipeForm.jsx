import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './AddRecipeForm.css';

const addRecipeSchema = yup.object({
    name: yup.string().trim().required('O nome da receita é obrigatório.'),
});

export default function AddRecipeForm() {
    const { authState } = useContext(AuthContext);
    const [submitMessage, setSubmitMessage] = useState(null);

    const API_BASE_URL = 'https://localhost:8443/api'; 

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError, 
    } = useForm({
        resolver: yupResolver(addRecipeSchema),
        defaultValues: { name: '' }, 
    });

    const onSubmit = async (data) => {
        setSubmitMessage(null); 

        const recipeData = {
            name: data.name,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.token}`,
                },
                body: JSON.stringify(recipeData), 
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitMessage({ type: 'success', text: result.message || 'Receita adicionada com sucesso!' });
                reset(); 
            } else {

                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(err => {
                        if (err.path) {
                            setError(err.path, { message: err.msg });
                        } else {
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
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Receita'}
                </button>
            </form>
        </div>
    );
}