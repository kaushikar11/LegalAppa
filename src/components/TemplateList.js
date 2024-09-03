import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { db } from '../firebase/firebase';
import { gemini } from '../firebase/gemini';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const { GoogleGenerativeAI } = require("@google/generative-ai");

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetails, setTemplateDetails] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  
  const genAI = new GoogleGenerativeAI(gemini);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    const fetchTemplates = async () => {
      const storage = getStorage();
      const listRef = ref(storage, 'uploads/');
      
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
  }, []);

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
      const response = await fetch(template.url);
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
      console.error("Error extracting text from template:", error);
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

    const handleEditorChange = (content) => {
      setSelectedTemplate(content);
  };

    try {
      setIsConverting(true);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const latexText = response.text();
      setResponseText(latexText);

      // Send LaTeX to server for conversion
      const serverResponse = await axios.post('http://localhost:3001/convert', { latex: latexText }, { responseType: 'blob' });
      
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

  return (
    <Container>
      <Section>
        <Title>Available Templates</Title>
        <TemplateList>
          {templates.map(template => (
            <TemplateItem key={template.id}>
              <TemplateName>{template.name}</TemplateName>
              <Button onClick={() => handleTemplateClick(template)}>Extract and Edit</Button>
            </TemplateItem>
          ))}
        </TemplateList>
      </Section>

      {selectedTemplate && (
  <Section>
  <Title>Edit Document</Title>
  <div
      contentEditable={true}
      suppressContentEditableWarning={true}
      style={{
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f8f8f8',
        marginBottom: '1rem',
        whiteSpace: 'pre-wrap',
      }}
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
  );
};

export default TemplatesList;

const ConversionStatus = styled.div`
  margin-top: 1rem;
  color: #4a90e2;
  font-weight: bold;
`;

// Styled Components
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

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 4rem 0;
  
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
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #357abd;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
  resize: vertical;
`;

const LaTeXOutput = styled.pre`
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 0.9rem;
`;