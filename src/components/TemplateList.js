import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { useTheme } from '../contexts/themeContext';
import { list, remove } from '../storage/supabase';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesData = await list(currentUser.email);
        setTemplates(templatesData);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    if (currentUser?.email) {
      fetchTemplates();
    }
  }, [currentUser?.email]);

  const extractTextFromDOCX = async (arrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  };

  const handleTemplateClick = async (template) => {
    try {
      const response = await fetch(template.url, {
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch template. Status: ${response.status} - ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      let text;
  
      if (template.name.endsWith('.docx')) {
        text = await extractTextFromDOCX(arrayBuffer);
      } else if (template.name.endsWith('.pdf')) {
        text = await extractTextFromPDF(arrayBuffer);
      } else {
        throw new Error('Unsupported file format');
      }
  
      // Navigate to edit page with template data
      navigate('/edit', {
        state: {
          templateContent: text,
          templateName: template.name,
          templateUrl: template.url
        }
      });
    } catch (error) {
      console.error("Error extracting text from template:", error.message);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleDelete = async (template) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this template?');
    if (!confirmDelete) return;
  
    try {
      // template.id now contains the full path (e.g., "uploads/user@email.com/timestamp_filename.docx")
      await remove(template.id);
  
      // Remove from state
      setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== template.id));
    } catch (error) {
      console.error("Error deleting template:", error);
      alert(`Failed to delete file: ${error.message || 'Unknown error'}`);
    }
  };


  const GlobalStyle = createGlobalStyle`
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

body {
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFF8E7'};
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  transition: background-color 0.3s ease;
}
`;

  return (
    <>
    <GlobalStyle theme={theme} />
      <UserInfo theme={theme}>
        You are logged in as {currentUser.displayName ? currentUser.displayName : currentUser.email}
      </UserInfo>
      <Container theme={theme}>
        <Section>
          <Title theme={theme}>Your Templates</Title>
          <TemplateList>
            {templates.map(template => (
              <TemplateItem key={template.id} theme={theme}>
                <TemplateName theme={theme}>{template.name}</TemplateName>
                <ButtonContainer>
                  <Button onClick={() => handleTemplateClick(template)} theme={theme}>Extract and Edit</Button>
                  <DeleteButton onClick={() => handleDelete(template)} theme={theme}>Delete</DeleteButton>
                </ButtonContainer>
              </TemplateItem>
            ))}
          </TemplateList>
        </Section>

      </Container>
    </>
  );
};

export default TemplatesList;
// Styled Components

const UserInfo = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#4B5563'};
  margin: 1rem 0;
  padding: 0 2rem;
  transition: color 0.3s ease;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 8px 32px rgba(0, 0, 0, 0.08)'};
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  transition: all 0.3s ease;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 1.8rem;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
`;

const TemplateList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TemplateItem = styled.li`
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  justify-content: space-between;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FEFDF9'};
  border-radius: 10px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#334155' : '#F9FAFB'};
    border-color: ${props => props.theme === 'dark' ? '#475569' : '#D1D5DB'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
      : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const TemplateName = styled.h2`
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  margin: 0;
  transition: color 0.3s ease;
`;

const Button = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 8px rgba(99, 102, 241, 0.3)' 
    : '0 2px 8px rgba(59, 130, 246, 0.3)'};

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4F46E5' : '#2563EB'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 4px 14px rgba(99, 102, 241, 0.4)' 
      : '0 4px 14px rgba(59, 130, 246, 0.4)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#EF4444' : '#DC2626'};

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#F87171' : '#EF4444'};
  }
`;

