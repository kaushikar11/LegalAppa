// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TemplatesList from './components/TemplateList';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/templates" element={<TemplatesList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;