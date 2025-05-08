import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { RecipesContext } from '../contexts/RecipesContext';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './SearchForm.css';

// Schema de validação com mensagem personalizada
const searchSchema = yup.object({
  search: yup
    .string()
    .trim()
    .required('Por favor, digite o nome de uma receita'),
});

export default function SearchForm() {
  const { fetchRecipes } = useContext(RecipesContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(searchSchema),
    defaultValues: {
      search: '',
    },
  });

  const onSubmit = ({ search }) => {
    fetchRecipes(search);
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
