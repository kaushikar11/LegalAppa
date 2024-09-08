import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';


const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleModifyDocument = () => {
    navigate('/templates', { state: { fileUrl: downloadURL } });
  };

  const handleUpload = () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${currentUser.email}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url);
          console.log("File available at", url);
        });
      }
    );
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
        <Title>Upload a File</Title>
        <SubTitle>Only DOCx format is supported at the moment!</SubTitle>
        <UploadBox>
          <FileInput type="file" onChange={handleFileChange} />
          <UploadButton onClick={handleUpload}>Upload</UploadButton>
        </UploadBox>
        <ProgressBar progress={uploadProgress} />
        <ProgressText>Upload Progress: {uploadProgress.toFixed(2)}%</ProgressText>
        {downloadURL && (
          <DownloadLink>
            File available at: <a href={downloadURL} target="_blank" rel="noopener noreferrer">Download</a> <br></br>
            <ModifyButton onClick={handleModifyDocument}>Modify Document</ModifyButton>
          </DownloadLink>
        )}
      </Container>
    </>
  );
};

export default FileUpload;

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

const UserInfo = styled.div`
  font-size: 1.25rem;
  color: black;
  
  margin: 1rem 0;
`;

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: ${slideIn} 0.5s ease-out;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-family: 'Arial', sans-serif;
`;

const SubTitle = styled.h1`
  color: grey;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-family: 'Arial', sans-serif;
`;

const UploadBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const FileInput = styled.input`
  flex: 1;
  color: black;
  padding: 0.5rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
`;

const UploadButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #555;
    transform: scale(1.05);
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: #4caf50;
    transition: width 0.3s ease-out;
  }
`;

const ProgressText = styled.p`
  color: #666;
  font-size: 1rem;
  text-align: center;
`;

const DownloadLink = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: #333;
  
  a {
    color: #333;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ModifyButton = styled.button`
  display: block;
  margin: 1rem auto;
  padding: 0.6rem 1.2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  text-align: center;

  &:hover {
    background-color: #0056b3;
  }
`;