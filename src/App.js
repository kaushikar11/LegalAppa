import logo from './logo.svg';
import './App.css';
import TemplatesList from './components/TemplateList';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="App">
      <TemplatesList />
      <FileUpload />
    </div>
  );
}

export default App;
