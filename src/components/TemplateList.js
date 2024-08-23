// src/components/TemplatesList.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const templatesCollection = collection(db, 'templates');
      const templateSnapshot = await getDocs(templatesCollection);
      const templateList = templateSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templateList);
    };

    fetchTemplates();
  }, []);

  return (
    <div>
      <h1>Available Templates</h1>
      <ul>
        {templates.map(template => (
          <li key={template.id}>
            <h2>{template.name}</h2>
            <p>{template.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplatesList;
