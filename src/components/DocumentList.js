// src/components/DocumentList.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const firestore = getFirestore(db);
      const documentsCollection = collection(firestore, 'uploads/'); // Replace 'documents' with your collection name
      const querySnapshot = await getDocs(documentsCollection);
      
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDocuments(docs);
    };

    fetchDocuments();
  }, []);

  return (
    <div>
      <h2>Available Documents</h2>
      {documents.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <ul>
          {documents.map(doc => (
            <li key={doc.id}>
              {doc.name} - <a href={doc.url} target="_blank" rel="noopener noreferrer">Download</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentList;