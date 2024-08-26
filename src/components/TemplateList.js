import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { db } from '../firebase/firebase';
import { gemini } from '../firebase/gemini';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetails, setTemplateDetails] = useState('');
  const { GoogleGenerativeAI } = require("@google/generative-ai");
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
      Convert the following text extracted from a document to LaTeX format, ensuring proper centering and formatting:
      
      Extracted text: ${selectedTemplate}
      
      Additional details: ${templateDetails}
      
      Please provide the output in LaTeX format.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setResponseText(text);
    } catch (error) {
      console.error("Error generating LaTeX content:", error);
      setResponseText("An error occurred while generating the LaTeX content.");
    }
  };

  return (
    <div>
      <h1>Available Templates</h1>
      <ul>
        {templates.map(template => (
          <li key={template.id}>
            <h2>{template.name}</h2>
            <button onClick={() => handleTemplateClick(template)}>Extract and Edit</button>
          </li>
        ))}
      </ul>

      {selectedTemplate && (
        <div>
          <h2>Template Details</h2>
          <form onSubmit={handleDetailsSubmit}>
            <textarea
              value={templateDetails}
              onChange={(e) => setTemplateDetails(e.target.value)}
              placeholder="Enter additional details for template manipulation"
              rows={5}
              cols={50}
            />
            <br />
            <button type="submit">Generate LaTeX</button>
          </form>
        </div>
      )}

      <div>
        <h1>Generated LaTeX</h1>
        <pre>{responseText}</pre>
      </div>
    </div>
  );
};

export default TemplatesList;