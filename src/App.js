import logo from './logo.svg';
import './App.css';
import TemplatesList from './components/TemplateList';
import FileUpload from './components/FileUpload';
import Gemini from './components/gemini'

function App() {
  return (
    <div className="App">
      <FileUpload />
      <TemplatesList />
      <Gemini />
    </div>
  );
}

export default App;
