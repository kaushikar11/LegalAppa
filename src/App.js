import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import TemplatesList from './components/TemplateList';
import FileUpload from './components/FileUpload';
import DocumentEditor from './components/DocumentEditor';
import Chatbot from './components/Chatbot';
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { AuthProvider } from "./contexts/authContext";
import { ThemeProvider } from "./contexts/themeContext";
import { Analytics } from "@vercel/analytics/react"

const MainContent = styled.main`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <MainContent>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <PageWithChatbot />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/templates" 
                element={
                  <ProtectedRoute>
                    <PageWithChatbot />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit" 
                element={
                  <ProtectedRoute>
                    <PageWithChatbot />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </MainContent>
            <Footer />
          </div>
        </Router>
        <Analytics />
      </AuthProvider>
    </ThemeProvider>
  );
}

const PageWithChatbot = () => {
  const location = useLocation();
  const showChatbot = location.pathname === '/upload' || location.pathname === '/templates' || location.pathname === '/edit';

  return (
    <>
      {showChatbot && <Chatbot />}
      {location.pathname === '/upload' && <FileUpload />}
      {location.pathname === '/templates' && <TemplatesList />}
      {location.pathname === '/edit' && <DocumentEditor />}
    </>
  );
}

export default App;
