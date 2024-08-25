// src/components/TemplatesList.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { db } from '../firebase/firebase';

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);

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

  return (
    <div>
      <h1>Available Templates</h1>
      <ul>
        {templates.map(template => (
          <li key={template.id}>
            <h2>{template.name}</h2>
            <a href={template.url} target="_blank" rel="noopener noreferrer">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplatesList;