import Header from './components/Header';
import SearchForm from './components/SearchForm';
import RecipeList from './components/RecipeList';
import './App.css';

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