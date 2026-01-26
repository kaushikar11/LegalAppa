import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useTheme } from '../contexts/themeContext';
import { GoogleGenAI } from "@google/genai";
import { gemini } from '../firebase/gemini';
import axios from 'axios';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import VoiceInput from './VoiceInput';

// Helper functions outside component
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

const DocumentEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [templateContent, setTemplateContent] = useState('');
  const [templateDetails, setTemplateDetails] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [versionHistory, setVersionHistory] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  // Initialize Gemini 2.5 Flash for document manipulation
  const ai = new GoogleGenAI({
    apiKey: gemini
  });

  const handleTemplateFetch = useCallback(async (url, name) => {
    try {
      setTemplateName(name || 'Document');
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Failed to fetch template. Status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      let text;

      if (name?.endsWith('.docx')) {
        text = await extractTextFromDOCX(arrayBuffer);
      } else if (name?.endsWith('.pdf')) {
        text = await extractTextFromPDF(arrayBuffer);
      } else {
        throw new Error('Unsupported file format');
      }

      setTemplateContent(text);
    } catch (error) {
      console.error("Error extracting text from template:", error.message);
      alert(`Error: ${error.message}`);
      navigate('/templates');
    }
  }, [navigate]);

  useEffect(() => {
    // Get template data from navigation state
    if (location.state?.templateContent) {
      const initialContent = location.state.templateContent;
      setTemplateContent(initialContent);
      setTemplateName(location.state.templateName || 'Document');
      // Initialize version history with original document
      setVersionHistory([{
        content: initialContent,
        timestamp: new Date().toISOString(),
        description: 'Original document'
      }]);
      setCurrentVersionIndex(0);
    } else if (location.state?.templateUrl) {
      // If URL provided, fetch and extract
      handleTemplateFetch(location.state.templateUrl, location.state.templateName);
    } else {
      // No template data, redirect back
      navigate('/templates');
    }
  }, [location.state, navigate, handleTemplateFetch]);

  // Initialize version history when template is fetched
  useEffect(() => {
    if (templateContent && versionHistory.length === 0) {
      setVersionHistory([{
        content: templateContent,
        timestamp: new Date().toISOString(),
        description: 'Original document'
      }]);
      setCurrentVersionIndex(0);
    }
  }, [templateContent, versionHistory.length]);

  // Handle document modification
  const handleModify = async (e) => {
    e.preventDefault();
    if (!templateContent) return;

    const prompt = `
You are a legal document editing expert. Your task is to modify the following legal document according to the user's instructions.

User's modification instructions: ${templateDetails || 'None specified - just improve the document formatting and clarity'}

Current document text:
${templateContent}

IMPORTANT INSTRUCTIONS:
1. Output ONLY the modified document text - no explanations, no markdown, no LaTeX code, no extra text
2. Apply the user's modifications while preserving the document's legal structure
3. Maintain proper formatting: sections, paragraphs, lists, headings
4. Preserve all legal terminology, dates, names, and important details
5. Improve clarity and professionalism where appropriate
6. If the user wants specific changes (like adding signature blocks, changing tone, etc.), implement those changes
7. Return the complete modified document text, ready to be displayed

Output the complete modified document text now:
    `;

    try {
      setIsModifying(true);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
        }
      });
      
      let modifiedText = response.text || '';
      
      if (!modifiedText) {
        if (response.response && typeof response.response.text === 'function') {
          modifiedText = response.response.text();
        } else if (response.response && response.response.text) {
          modifiedText = response.response.text;
        } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
          modifiedText = response.candidates[0].content.parts[0].text;
        }
      }
      
      if (!modifiedText) {
        throw new Error('Unable to extract modified text from response');
      }

      // Clean up the response (remove markdown code blocks if present)
      modifiedText = modifiedText.replace(/```[\s\S]*?```/g, '').trim();
      modifiedText = modifiedText.replace(/^```[\w]*\n?/gm, '').trim();
      modifiedText = modifiedText.replace(/```$/gm, '').trim();

      // Update the document content
      setTemplateContent(modifiedText);
      
      // Add to version history
      const newVersion = {
        content: modifiedText,
        timestamp: new Date().toISOString(),
        description: templateDetails || 'Document modified'
      };
      
      // If we're not at the latest version, remove future versions
      const updatedHistory = versionHistory.slice(0, currentVersionIndex + 1);
      updatedHistory.push(newVersion);
      setVersionHistory(updatedHistory);
      setCurrentVersionIndex(updatedHistory.length - 1);
      
      // Clear the modification instructions
      setTemplateDetails('');
    } catch (error) {
      console.error("Error modifying document:", error);
      alert(`Error modifying document: ${error.message || 'Unknown error'}`);
    } finally {
      setIsModifying(false);
    }
  };

  // Handle document download
  const handleDownload = async () => {
    if (!templateContent) {
      alert('No document content to download');
      return;
    }

    const prompt = `
You are a legal document LaTeX expert. Your task is to convert the following legal document text into properly formatted LaTeX code.

Document text to convert:
${templateContent}

IMPORTANT INSTRUCTIONS:
1. Output ONLY valid LaTeX code - no explanations, no markdown, no extra text
2. Ensure proper document structure with \\documentclass, \\begin{document}, \\end{document}
3. Use appropriate LaTeX packages (\\usepackage) for legal documents
4. Maintain proper formatting: sections, subsections, paragraphs, lists
5. Preserve all legal terminology and structure exactly as provided
6. Use proper LaTeX commands for formatting (\\textbf, \\textit, \\underline, etc.)
7. Ensure proper spacing and indentation
8. Do NOT add any content that wasn't in the original document
9. Validate your LaTeX syntax before outputting

Output the complete LaTeX document code now:
    `;

    try {
      setIsDownloading(true);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
        }
      });
      
      let latexText = response.text || '';
      
      if (!latexText) {
        if (response.response && typeof response.response.text === 'function') {
          latexText = response.response.text();
        } else if (response.response && response.response.text) {
          latexText = response.response.text;
        } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
          latexText = response.candidates[0].content.parts[0].text;
        }
      }
      
      if (!latexText) {
        throw new Error('Unable to extract LaTeX from response');
      }

      // Clean up LaTeX (remove markdown code blocks if present)
      latexText = latexText.replace(/```[\s\S]*?```/g, '').trim();
      latexText = latexText.replace(/^```latex\n?/gm, '').trim();
      latexText = latexText.replace(/^```\n?/gm, '').trim();
      latexText = latexText.replace(/```$/gm, '').trim();

      // Send LaTeX to server for conversion
      const serverResponse = await axios.post('https://latextodocx.onrender.com/convert', { latex: latexText }, { responseType: 'blob' });
      
      // Create a download link for the converted file
      const url = window.URL.createObjectURL(new Blob([serverResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${templateName.replace(/\.[^/.]+$/, '')}_final.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert(`Error downloading document: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Navigate to a specific version
  const goToVersion = (index) => {
    if (index >= 0 && index < versionHistory.length) {
      setTemplateContent(versionHistory[index].content);
      setCurrentVersionIndex(index);
    }
  };

  // Navigate to previous version
  const goToPreviousVersion = () => {
    if (currentVersionIndex > 0) {
      goToVersion(currentVersionIndex - 1);
    }
  };

  // Navigate to next version
  const goToNextVersion = () => {
    if (currentVersionIndex < versionHistory.length - 1) {
      goToVersion(currentVersionIndex + 1);
    }
  };

  const handleBack = () => {
    navigate('/templates');
  };

  return (
    <>
      <GlobalStyle theme={theme} />
      <PageContainer theme={theme}>
        <HeaderSection>
          <BackButton onClick={handleBack} theme={theme}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Templates
          </BackButton>
          <PageTitle theme={theme}>Edit Document</PageTitle>
          <PageSubtitle theme={theme}>{templateName}</PageSubtitle>
        </HeaderSection>

        <MainContainer theme={theme}>
          <Section>
            <Title theme={theme}>Edit & Generate</Title>
            <EditorLayout>
              <EditorPanel theme={theme}>
                <PanelHeader>
                  <PanelTitle theme={theme}>Document Editor</PanelTitle>
                  <PanelSubtitle theme={theme}>
                    Review and edit the document. Each modification creates a new version.
                  </PanelSubtitle>
                </PanelHeader>
                {versionHistory.length > 0 && (
                  <VersionControls theme={theme}>
                    <VersionInfo theme={theme}>
                      Version {currentVersionIndex + 1} of {versionHistory.length}
                    </VersionInfo>
                    <VersionButtons>
                      <VersionNavButton
                        theme={theme}
                        onClick={goToPreviousVersion}
                        disabled={currentVersionIndex === 0}
                        title="Previous version"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 18l-6-6 6-6"/>
                        </svg>
                      </VersionNavButton>
                      <VersionNavButton
                        theme={theme}
                        onClick={goToNextVersion}
                        disabled={currentVersionIndex === versionHistory.length - 1}
                        title="Next version"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </VersionNavButton>
                    </VersionButtons>
                    {currentVersionIndex > 0 && (
                      <VersionDescription theme={theme}>
                        {versionHistory[currentVersionIndex].description}
                      </VersionDescription>
                    )}
                  </VersionControls>
                )}
                <DocumentContainer theme={theme}>
                  <EditableDocument
                    theme={theme}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={(e) => setTemplateContent(e.target.innerText)}
                    dangerouslySetInnerHTML={{ __html: templateContent.replace(/\n/g, '<br/>') }}
                  />
                </DocumentContainer>
                <HelperText theme={theme}>
                  You can edit directly here or use modification instructions on the right. Each modification creates a new version you can navigate through.
                </HelperText>
              </EditorPanel>

              <ControlsPanel theme={theme}>
                <PanelHeader>
                  <PanelTitle theme={theme}>Editing Instructions</PanelTitle>
                  <PanelSubtitle theme={theme}>
                    Tell the AI how to transform this document (tone, structure, clauses, formatting).
                  </PanelSubtitle>
                </PanelHeader>
                <Form onSubmit={handleModify}>
                  <InputWrapper>
                    <TextArea
                      theme={theme}
                      value={templateDetails}
                      onChange={(e) => setTemplateDetails(e.target.value)}
                      placeholder="Example: “Convert to a formal employment agreement, add signature blocks for both parties, keep all dates and names unchanged.”"
                      rows={7}
                    />
                    <VoiceInputWrapper>
                      <VoiceInput
                        onTranscript={(text) => {
                          setTemplateDetails(prev => prev ? `${prev} ${text}` : text);
                        }}
                        onError={(error) => {
                          alert(error);
                        }}
                        disabled={isModifying || isDownloading}
                      />
                      <VoiceHint theme={theme}>
                        Click to speak your editing instructions
                      </VoiceHint>
                    </VoiceInputWrapper>
                  </InputWrapper>
                  <ButtonGroup>
                    <ModifyButton type="submit" theme={theme} disabled={isModifying || isDownloading}>
                      {isModifying ? (
                        <>
                          <Spinner />
                          Modifying...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Modify Document
                        </>
                      )}
                    </ModifyButton>
                    <DownloadButton 
                      type="button" 
                      theme={theme} 
                      onClick={handleDownload}
                      disabled={isModifying || isDownloading || !templateContent}
                    >
                      {isDownloading ? (
                        <>
                          <Spinner />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Download DOCX
                        </>
                      )}
                    </DownloadButton>
                  </ButtonGroup>
                </Form>
              </ControlsPanel>
            </EditorLayout>
          </Section>

        </MainContainer>
      </PageContainer>
    </>
  );
};

export default DocumentEditor;

// Styled Components
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFF8E7'};
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    transition: background-color 0.3s ease;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const PageContainer = styled.div`
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${slideIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid ${props => props.theme === 'dark' ? '#475569' : '#D1D5DB'};
  border-radius: 10px;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#334155' : '#F3F4F6'};
    border-color: ${props => props.theme === 'dark' ? '#64748B' : '#9CA3AF'};
    color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  margin: 0.5rem 0;
  transition: color 0.3s ease;
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  margin-top: 0.5rem;
  transition: color 0.3s ease;
`;

const MainContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
  border-radius: 20px;
  padding: 3rem;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 10px 40px rgba(0, 0, 0, 0.08)'};
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
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 1rem;
  line-height: 1.7;
  transition: all 0.3s ease;
  min-height: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

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
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const VoiceInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#F9FAFB'};
  border-radius: 10px;
  border: 1px dashed ${props => props.theme === 'dark' ? '#334155' : '#D1D5DB'};
`;

const VoiceHint = styled.p`
  font-size: 0.8125rem;
  color: ${props => props.theme === 'dark' ? '#94A3B8' : '#6B7280'};
  margin: 0;
  text-align: center;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ModifyButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
      : '0 6px 20px rgba(59, 130, 246, 0.4)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const DownloadButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
    : 'linear-gradient(135deg, #059669 0%, #10B981 100%)'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 14px rgba(16, 185, 129, 0.4)' 
    : '0 4px 14px rgba(5, 150, 105, 0.3)'};
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 20px rgba(16, 185, 129, 0.5)' 
      : '0 6px 20px rgba(5, 150, 105, 0.4)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const VersionControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#F9FAFB'};
  border-radius: 10px;
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
`;

const VersionInfo = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
`;

const VersionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const VersionNavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 6px;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.4 : 1};

  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#334155' : '#F3F4F6'};
    border-color: ${props => props.theme === 'dark' ? '#475569' : '#D1D5DB'};
  }
`;

const VersionDescription = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme === 'dark' ? '#94A3B8' : '#6B7280'};
  font-style: italic;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

