import logo from './logo.svg';
import './App.css';
import TemplatesList from './components/TemplateList';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="App">
      <FileUpload />
      <TemplatesList />
    </div>
  );
}

export default App;
