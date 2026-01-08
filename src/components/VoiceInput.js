import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../contexts/themeContext';

const VoiceInput = ({ onTranscript, onError, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        
        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error occurred.';
        if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please try again.';
        } else if (event.error === 'audio-capture') {
          errorMessage = 'No microphone found. Please check your microphone.';
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
        }
        
        if (onError) {
          onError(errorMessage);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      if (onError) {
        onError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onError]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (onError) {
          onError('Failed to start voice recognition. Please try again.');
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <VoiceInputContainer theme={theme}>
      <VoiceButton
        theme={theme}
        onClick={toggleListening}
        disabled={disabled}
        $isListening={isListening}
        type="button"
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? (
          <>
            <PulseRing />
            <MicIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14C13.1 14 14 13.1 14 12V6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6V12C10 13.1 10.9 14 12 14Z" fill="currentColor"/>
                <path d="M19 10V12C19 15.9 15.9 19 12 19C8.1 19 5 15.9 5 12V10H7V12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12V10H19Z" fill="currentColor"/>
                <path d="M11 22H13V20H11V22Z" fill="currentColor"/>
              </svg>
            </MicIcon>
            <ButtonText>Listening...</ButtonText>
          </>
        ) : (
          <>
            <MicIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14C13.1 14 14 13.1 14 12V6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6V12C10 13.1 10.9 14 12 14Z" fill="currentColor"/>
                <path d="M19 10V12C19 15.9 15.9 19 12 19C8.1 19 5 15.9 5 12V10H7V12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12V10H19Z" fill="currentColor"/>
                <path d="M11 22H13V20H11V22Z" fill="currentColor"/>
              </svg>
            </MicIcon>
            <ButtonText>Voice Input</ButtonText>
          </>
        )}
      </VoiceButton>
      {transcript && (
        <TranscriptPreview theme={theme}>
          {transcript}
        </TranscriptPreview>
      )}
    </VoiceInputContainer>
  );
};

export default VoiceInput;

// Styled Components
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

const VoiceInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const VoiceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => {
    if (props.disabled) {
      return props.theme === 'dark' ? '#475569' : '#D1D5DB';
    }
    return props.$isListening
      ? props.theme === 'dark' 
        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
        : 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
      : props.theme === 'dark'
        ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
        : 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)';
  }};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isListening
    ? props.theme === 'dark'
      ? '0 4px 14px rgba(239, 68, 68, 0.4)'
      : '0 4px 14px rgba(220, 38, 38, 0.4)'
    : props.theme === 'dark'
      ? '0 4px 14px rgba(99, 102, 241, 0.4)'
      : '0 4px 14px rgba(59, 130, 246, 0.3)'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  position: relative;
  overflow: visible;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isListening
      ? props.theme === 'dark'
        ? '0 6px 20px rgba(239, 68, 68, 0.5)'
        : '0 6px 20px rgba(220, 38, 38, 0.5)'
      : props.theme === 'dark'
        ? '0 6px 20px rgba(99, 102, 241, 0.5)'
        : '0 6px 20px rgba(59, 130, 246, 0.4)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const PulseRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.3)'};
  animation: ${pulse} 1.5s ease-out infinite;
  pointer-events: none;
`;

const MicIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
`;

const ButtonText = styled.span`
  position: relative;
  z-index: 1;
`;

const TranscriptPreview = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#F9FAFB'};
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
  font-size: 0.875rem;
  max-width: 100%;
  word-wrap: break-word;
  transition: all 0.3s ease;
  max-height: 100px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1E293B' : '#F3F4F6'};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#475569' : '#D1D5DB'};
    border-radius: 3px;
  }
`;

