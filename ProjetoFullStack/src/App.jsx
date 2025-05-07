import Header from './components/Header';
import SearchForm from './components/SearchForm';
import RecipeList from './components/RecipeList';

function App() {
  return (
    <div className="container">
      <Header />
      <SearchForm />
      <RecipeList />
    </div>
  );
}

export default App;