import React, { useState, useRef, useCallback } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { useTheme } from '../contexts/themeContext';
import { useNavigate } from 'react-router-dom';
import { upload } from '../storage/supabase';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      '.docx',
      '.doc'
    ];
    
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    const isValidType = validTypes.some(type => 
      selectedFile.type === type || 
      fileExtension === type.replace('.', '')
    );

    if (!isValidType) {
      setError('Please upload a DOCX file only. Other formats are not supported.');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50MB limit. Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setDownloadURL('');
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      const result = await upload(
        file,
        currentUser.email,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setDownloadURL(result.url);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Upload failed", error);
      setError(`Upload failed: ${error.message || 'Unknown error. Please try again.'}`);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleModifyDocument = () => {
    navigate('/templates', { state: { fileUrl: downloadURL } });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setDownloadURL('');
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <GlobalStyle theme={theme} />
      <PageContainer theme={theme}>
        <HeaderSection>
          <WelcomeText theme={theme}>
            Welcome back, <UserName>{currentUser.displayName || currentUser.email}</UserName>
          </WelcomeText>
          <PageTitle theme={theme}>Upload Document</PageTitle>
          <PageSubtitle theme={theme}>
            Upload your DOCX files to get started with document editing and manipulation
          </PageSubtitle>
        </HeaderSection>

        <MainContainer theme={theme}>
          {!downloadURL ? (
            <>
              <UploadZone
                theme={theme}
                isDragging={isDragging}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <UploadIcon theme={theme}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </UploadIcon>
                <UploadText theme={theme}>
                  {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                </UploadText>
                <UploadSubtext theme={theme}>
                  or <BrowseLink>browse</BrowseLink> to choose a file
                </UploadSubtext>
                <FileTypeHint theme={theme}>
                  Supported format: DOCX (Max size: 50MB)
                </FileTypeHint>
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </UploadZone>

              {file && (
                <FilePreview theme={theme}>
                  <FileInfo>
                    <FileIcon>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </FileIcon>
                    <FileDetails>
                      <FileName theme={theme}>{file.name}</FileName>
                      <FileSize theme={theme}>{formatFileSize(file.size)}</FileSize>
                    </FileDetails>
                    <RemoveButton onClick={handleRemoveFile} theme={theme} disabled={isUploading}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </RemoveButton>
                  </FileInfo>
                </FilePreview>
              )}

              {error && (
                <ErrorMessage theme={theme}>
                  <ErrorIcon>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </ErrorIcon>
                  {error}
                </ErrorMessage>
              )}

              {uploadProgress > 0 && (
                <ProgressSection theme={theme}>
                  <ProgressHeader>
                    <ProgressLabel theme={theme}>Uploading...</ProgressLabel>
                    <ProgressPercent theme={theme}>{uploadProgress.toFixed(0)}%</ProgressPercent>
                  </ProgressHeader>
                  <ProgressBar theme={theme}>
                    <ProgressFill progress={uploadProgress} theme={theme} />
                  </ProgressBar>
                </ProgressSection>
              )}

              <ActionButtons>
                <UploadButton
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  theme={theme}
                  isUploading={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Upload Document
                    </>
                  )}
                </UploadButton>
              </ActionButtons>
            </>
          ) : (
            <SuccessSection theme={theme}>
              <SuccessIcon>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </SuccessIcon>
              <SuccessTitle theme={theme}>Upload Successful!</SuccessTitle>
              <SuccessText theme={theme}>
                Your document has been uploaded successfully and is ready for editing.
              </SuccessText>
              <ActionButtons>
                <PrimaryButton onClick={handleModifyDocument} theme={theme}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Document
                </PrimaryButton>
                <SecondaryButton onClick={handleRemoveFile} theme={theme}>
                  Upload Another
                </SecondaryButton>
              </ActionButtons>
            </SuccessSection>
          )}
        </MainContainer>
      </PageContainer>
    </>
  );
};

export default FileUpload;

// Styled Components
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFF8E7'};
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
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

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PageContainer = styled.div`
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${slideIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const WelcomeText = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#94A3B8' : '#6B7280'};
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
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

const UploadZone = styled.div`
  border: 3px dashed ${props => 
    props.isDragging 
      ? (props.theme === 'dark' ? '#818CF8' : '#3B82F6')
      : (props.theme === 'dark' ? '#475569' : '#D1D5DB')
  };
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => 
    props.isDragging 
      ? (props.theme === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(59, 130, 246, 0.05)')
      : (props.theme === 'dark' ? '#0F172A' : '#F9FAFB')
  };
  
  &:hover {
    border-color: ${props => props.theme === 'dark' ? '#818CF8' : '#3B82F6'};
    background-color: ${props => props.theme === 'dark' ? 'rgba(129, 140, 248, 0.05)' : 'rgba(59, 130, 246, 0.03)'};
  }
`;

const UploadIcon = styled.div`
  color: ${props => props.theme === 'dark' ? '#818CF8' : '#3B82F6'};
  margin: 0 auto 1.5rem;
  transition: transform 0.3s ease;
  
  ${UploadZone}:hover & {
    transform: translateY(-4px);
  }
`;

const UploadText = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
`;

const UploadSubtext = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#94A3B8' : '#6B7280'};
  margin-top: 0.5rem;
  transition: color 0.3s ease;
`;

const BrowseLink = styled.span`
  color: ${props => props.theme === 'dark' ? '#818CF8' : '#3B82F6'};
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;

const FileTypeHint = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#64748B' : '#9CA3AF'};
  margin-top: 1.5rem;
  transition: color 0.3s ease;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#F9FAFB'};
  border-radius: 12px;
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  transition: all 0.3s ease;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FileIcon = styled.div`
  color: ${props => props.theme === 'dark' ? '#818CF8' : '#3B82F6'};
  flex-shrink: 0;
`;

const FileDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
`;

const FileSize = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#94A3B8' : '#6B7280'};
  transition: color 0.3s ease;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#94A3B8' : '#6B7280'};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    color: ${props => props.theme === 'dark' ? '#EF4444' : '#DC2626'};
    background-color: ${props => props.theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'};
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.3)'};
  border-radius: 12px;
  color: ${props => props.theme === 'dark' ? '#FCA5A5' : '#DC2626'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
`;

const ErrorIcon = styled.div`
  flex-shrink: 0;
`;

const ProgressSection = styled.div`
  margin-top: 2rem;
  transition: all 0.3s ease;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ProgressLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
  transition: color 0.3s ease;
`;

const ProgressPercent = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#818CF8' : '#3B82F6'};
  transition: color 0.3s ease;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 4px;
  overflow: hidden;
  transition: background-color 0.3s ease;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(90deg, #818CF8, #A78BFA)' 
    : 'linear-gradient(90deg, #667EEA, #818CF8)'};
  border-radius: 4px;
  transition: width 0.3s ease-out;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 0 8px rgba(129, 140, 248, 0.5)' 
    : '0 0 8px rgba(102, 126, 234, 0.5)'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 14px rgba(99, 102, 241, 0.4)' 
    : '0 4px 14px rgba(59, 130, 246, 0.3)'};
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#4F46E5' : '#2563EB'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
      : '0 6px 20px rgba(59, 130, 246, 0.4)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const SuccessSection = styled.div`
  text-align: center;
  padding: 2rem 0;
  transition: all 0.3s ease;
`;

const SuccessIcon = styled.div`
  color: ${props => props.theme === 'dark' ? '#10B981' : '#059669'};
  margin: 0 auto 1.5rem;
  animation: ${slideIn} 0.5s ease-out;
`;

const SuccessTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
`;

const SuccessText = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  margin-bottom: 2rem;
  transition: color 0.3s ease;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 14px rgba(99, 102, 241, 0.4)' 
    : '0 4px 14px rgba(59, 130, 246, 0.3)'};

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4F46E5' : '#2563EB'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
      : '0 6px 20px rgba(59, 130, 246, 0.4)'};
  }
`;

const SecondaryButton = styled.button`
  padding: 1rem 2rem;
  background-color: transparent;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  border: 2px solid ${props => props.theme === 'dark' ? '#475569' : '#D1D5DB'};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#334155' : '#F3F4F6'};
    border-color: ${props => props.theme === 'dark' ? '#64748B' : '#9CA3AF'};
  }
`;
