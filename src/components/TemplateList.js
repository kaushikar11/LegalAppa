import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
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

const ConversionStatus = styled.div`
  margin-top: 1rem;
  color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
  font-weight: 600;
  font-size: 0.9375rem;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '⏳';
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const EditorLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2.5fr);
  gap: 2rem;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const BasePanel = styled.div`
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  background-color: ${props => props.theme === 'dark' ? '#0B1220' : '#F9FAFB'};
  border: 1px solid ${props => props.theme === 'dark' ? '#1F2937' : '#E5E7EB'};
  box-shadow: ${props => props.theme === 'dark'
    ? '0 10px 30px rgba(0,0,0,0.45)'
    : '0 10px 30px rgba(15,23,42,0.06)'};
  transition: all 0.3s ease;
`;

const EditorPanel = styled(BasePanel)``;

const ControlsPanel = styled(BasePanel)``;

const PanelHeader = styled.div`
  margin-bottom: 1.25rem;
`;

const PanelTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#E5E7EB' : '#111827'};
`;

const PanelSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#9CA3AF' : '#6B7280'};
`;

const HelperText = styled.p`
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#9CA3AF' : '#6B7280'};
`;

const TextArea = styled.textarea`
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  border: 2px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 10px;
  font-size: 1rem;
  resize: vertical;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFFFFF'};
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
    background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 0 0 3px rgba(99, 102, 241, 0.1)' 
      : '0 0 0 3px rgba(59, 130, 246, 0.1)'};
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#64748B' : '#9CA3AF'};
  }
`;

const PrimaryActionButton = styled.button`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' 
    : 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 14px rgba(99, 102, 241, 0.4)' 
    : '0 4px 14px rgba(59, 130, 246, 0.3)'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
      : '0 6px 20px rgba(59, 130, 246, 0.4)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const LaTeXOutput = styled.pre`
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#F9FAFB'};
  padding: 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 8px;
  white-space: pre-wrap;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
  transition: all 0.3s ease;
`;

const DocumentContainer = styled.div`
  border: 2px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 12px;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFFFFF'};
  margin-bottom: 1.5rem;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark' 
    ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)' 
    : 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;

  &:focus-within {
    border-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
    box-shadow: ${props => props.theme === 'dark' 
      ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(99, 102, 241, 0.1)' 
      : 'inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(59, 130, 246, 0.1)'};
  }
`;

const EditableDocument = styled.div`
  padding: 1.5rem;
  max-height: 450px;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 1rem;
  line-height: 1.7;
  transition: all 0.3s ease;
  min-height: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1E293B' : '#F9FAFB'};
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#475569' : '#D1D5DB'};
    border-radius: 5px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme === 'dark' ? '#64748B' : '#9CA3AF'};
  }

  &:focus {
    outline: none;
  }

  /* Focus effect on container */
  &:focus-visible {
    outline: 2px solid ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
    outline-offset: -2px;
  }
`;

