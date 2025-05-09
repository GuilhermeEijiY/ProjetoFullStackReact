import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { RecipesContext } from '../contexts/RecipesContext';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './SearchForm.css';

// Definição do schema de validação com Yup
const searchSchema = yup.object({
  search: yup
    .string()
    .trim()
    .required('Por favor, digite o nome de uma receita'),
});

export default function SearchForm() {
  // Acessa a função de busca do contexto
  const { fetchRecipes } = useContext(RecipesContext);

  // Inicializa o formulário com validação Yup
  const {
    register, // Registra o input para rastreamento do valor
    handleSubmit, // Função que lida com o envio do formulário
    formState: { errors, isSubmitting }, // objeto com estado do formulário
    reset, // Reseta os campos do formulário
  } = useForm({
    resolver: yupResolver(searchSchema), // Valida com Yup
    defaultValues: {
      search: '', // Valor inicial do campo para vazio
    },
  });

  // Função chamada quando o formulário é submetido
  const onSubmit = ({ search }) => {
    fetchRecipes(search); // Chamada da API com o termo de busca
    reset(); // limpa o campo após submissão
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="search-form">
      <input
        type="text"
        placeholder="Digite o nome da receita"
        {...register('search')}
        aria-invalid={errors.search ? 'true' : 'false'}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Buscando...' : 'Buscar'}
      </button>
      <div className="error-message">
        {errors.search?.message || '\u00A0'}
      </div>
    </form>
  );
}
