import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { gemini } from '../firebase/gemini';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import axios from 'axios';
import cors from 'cors';
import { useAuth } from '../contexts/authContext';

const { GoogleGenerativeAI } = require("@google/generative-ai");

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetails, setTemplateDetails] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const { currentUser } = useAuth(); 
  
  const genAI = new GoogleGenerativeAI(gemini);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    const fetchTemplates = async () => {
      const storage = getStorage();
      const listRef = ref(storage, `uploads/${currentUser.email}`);
      
      try {
        const res = await listAll(listRef);
        const templatesData = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return {
              id: itemRef.name,
              name: itemRef.name,
              url: url,
            };
          })
        );
        
        setTemplates(templatesData);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, [currentUser.email]);

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
        mode: 'cors', // Ensure the request uses CORS mode
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
  
      setSelectedTemplate(text);
    } catch (error) {
      console.error("Error extracting text from template:", error.message);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleDelete = async (template) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this template?');
    if (!confirmDelete) return;
  
    try {
      const storage = getStorage();
      const templateRef = ref(storage, `uploads/${currentUser.email}/${template.id}`);
      
      // Delete the object using deleteObject
      await deleteObject(templateRef);
  
      // Remove from state
      setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== template.id));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const prompt = `
      Additional details: ${templateDetails} 
      
      ensuring proper centering and formatting:
      
      Extracted text: ${selectedTemplate}
      
      Please provide the output in LaTeX format & no extra text. Please don't hallucinate and make sure the latex syntax is correct.
    `;

    try {
      setIsConverting(true);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const latexText = response.text();
      setResponseText(latexText);

      // Send LaTeX to server for conversion
      const serverResponse = await axios.post('https://latexendpoint.onrender.com/convert', { latex: latexText }, { responseType: 'blob' });
      
      // Create a download link for the converted file
      const url = window.URL.createObjectURL(new Blob([serverResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'converted_document.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating or converting content:", error);
      setResponseText("An error occurred while processing the document.");
    } finally {
      setIsConverting(false);
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
  background-color: #fff; /* Set the background color to white */
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif; /* Optional: Set a global font */
}
`;

  return (
    <>
    <GlobalStyle />
      <UserInfo>
        You are logged in as {currentUser.displayName ? currentUser.displayName : currentUser.email}
      </UserInfo>
      <Container>
        <Section>
          <Title>Your Templates</Title>
          <TemplateList>
            {templates.map(template => (
              <TemplateItem key={template.id}>
                <TemplateName>{template.name}</TemplateName>
                <ButtonContainer>
                  <Button onClick={() => handleTemplateClick(template)}>Extract and Edit</Button>
                  <DeleteButton onClick={() => handleDelete(template)}>Delete</DeleteButton>
                </ButtonContainer>
              </TemplateItem>
            ))}
          </TemplateList>
        </Section>

        {selectedTemplate && (
  <Section>
    <Title>Edit Document</Title>
    <EditableDocument
      contentEditable={true}
      suppressContentEditableWarning={true}
      dangerouslySetInnerHTML={{ __html: selectedTemplate.replace(/\n/g, '<br/>') }}
    />
    <Form onSubmit={handleDetailsSubmit}>
      <TextArea
        value={templateDetails}
        onChange={(e) => setTemplateDetails(e.target.value)}
        placeholder="Enter additional details for template manipulation"
        rows={5}
      />
      <Button type="submit">Generate Document</Button>
    </Form>
  </Section>
)}


        <Section>
          <LaTeXOutput>{responseText}</LaTeXOutput>
          {isConverting && <ConversionStatus>Converting to DOCX...</ConversionStatus>}
        </Section>
      </Container>
    </>
  );
};

export default TemplatesList;
// Styled Components

const ConversionStatus = styled.div`
  margin-top: 1rem;
  color: #4a90e2;
  font-weight: bold;
`;

const UserInfo = styled.div`
  font-size: 1.25rem;
  color: black;
  margin: 1rem 0;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 1rem;
`;

const TemplateList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TemplateItem = styled.li`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  justify-content: space-between; /* Adjust as needed */
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const TemplateName = styled.h2`
  font-size: 1.2rem;
  color: #444;
  margin: 0;
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #357abd;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #e94e77;

  &:hover {
    background-color: #d63d5c;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  color: black; /* Ensure text color is black */
`;

const LaTeXOutput = styled.pre`
  background-color: #f8f8f8;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  white-space: pre-wrap;
  font-size: 1rem;
  color: #333;
`;

const EditableDocument = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f8f8;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  color: black; /* Ensure text color is black */
  font-size: 1rem;
`;

