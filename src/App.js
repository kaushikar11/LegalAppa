import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import TemplatesList from './components/TemplateList';
import FileUpload from './components/FileUpload';
import Chatbot from './components/Chatbot'; // Adjust the path as per your project structure
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import { AuthProvider } from "./contexts/authContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<PageWithChatbot />} />
            <Route path="/templates" element={<PageWithChatbot />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

const PageWithChatbot = () => {
  const location = useLocation();
  const showChatbot = location.pathname === '/upload' || location.pathname === '/templates';

  return (
    <>
      {showChatbot && <Chatbot />}
      {location.pathname === '/upload' && <FileUpload />}
      {location.pathname === '/templates' && <TemplatesList />}
    </>
  );
}

export default App;
