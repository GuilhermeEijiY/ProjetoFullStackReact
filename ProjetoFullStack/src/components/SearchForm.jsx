import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { RecipesContext } from '../contexts/RecipesContext';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './SearchForm.css';

const schema = yup.object().shape({
  search: yup.string().required('Campo obrigatório'),
});

export default function SearchForm() {
  const { fetchRecipes } = useContext(RecipesContext);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    fetchRecipes(data.search);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('search')} placeholder="Digite o nome da receita" />
      <button type="submit">Buscar</button>
      <div className="error-message">
        {errors.search?.message || '\u00A0'}
      </div>
    </form>
  );
}
