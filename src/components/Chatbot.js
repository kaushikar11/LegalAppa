import React, { useState, useRef, useEffect } from "react";
import MarkdownIt from "markdown-it";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { gemini2 } from "../firebase/gemini";
import { useTheme } from "../contexts/themeContext";
import styled, { keyframes } from "styled-components";
import VoiceInput from "./VoiceInput";

const md = new MarkdownIt();

// Initialize the model
// Using Gemini 2.5 Flash for fast, cost-effective chatbot responses
const genAI = new GoogleGenerativeAI(gemini2);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7, // Balanced temperature for natural conversational responses
    topP: 0.9,
  }
});

// System history for AI context - Customized for LegalAppa
const systemHistory = [
  {
    role: "user",
    parts: [{ text: "You are LegalAppa, an AI-powered legal document drafting and editing assistant. Your role is to help lawyers, legal professionals, and individuals create, edit, and improve legal documents. You specialize in:\n\n1. Document Drafting: Creating templates and drafts for contracts, agreements, letters, and other legal documents\n2. Document Review: Analyzing uploaded documents for structure, clarity, formatting, and completeness\n3. Document Editing: Improving grammar, style, legal terminology, and professional presentation\n4. Formatting Assistance: Ensuring proper legal document formatting, sections, numbering, and organization\n5. Content Suggestions: Providing recommendations for missing clauses, standard legal language, and best practices\n\nIMPORTANT GUIDELINES:\n- You are a DRAFTING TOOL, not a legal advisor\n- You help with document structure, language, and formatting\n- You do NOT provide legal advice, interpretations, or opinions on legal matters\n- Always remind users to consult qualified lawyers for legal advice\n- Focus on improving document quality, clarity, and professionalism\n- Be helpful, professional, and concise in your responses\n- When reviewing documents, provide specific, actionable feedback\n- Suggest improvements while maintaining legal document standards\n\nNow, introduce yourself as LegalAppa and explain how you can help with legal document drafting and editing." }]
  },
  {
    role: "model",
    parts: [{ text: "Hello! I'm **LegalAppa**, your AI-powered legal document drafting and editing assistant. 👨‍⚖️\n\nI'm here to help you create, refine, and improve legal documents with professional quality and clarity. Here's what I can do for you:\n\n**📝 Document Drafting**\n- Generate templates for contracts, agreements, letters, and other legal documents\n- Create structured drafts with proper sections and formatting\n- Help fill in standard legal language and clauses\n\n**🔍 Document Review**\n- Analyze uploaded documents for structure, clarity, and completeness\n- Identify formatting issues and inconsistencies\n- Check for missing standard sections or clauses\n\n**✏️ Document Editing**\n- Improve grammar, style, and professional presentation\n- Enhance legal terminology and precision\n- Refine language for clarity and impact\n\n**📋 Formatting Assistance**\n- Ensure proper legal document structure\n- Organize sections, headings, and numbering\n- Standardize formatting and presentation\n\n**💡 Content Suggestions**\n- Recommend missing clauses or standard language\n- Suggest improvements for clarity and completeness\n- Provide best practices for legal document writing\n\n**⚠️ Important Reminder:**\nI'm a drafting tool designed to help with document creation and improvement. I do NOT provide legal advice, interpretations, or opinions on legal matters. Always consult with a qualified lawyer for legal advice and to review documents before finalizing them.\n\n**How can I help you today?**\n- Upload a document for review\n- Ask me to draft a specific type of legal document\n- Request help with editing or formatting\n- Ask questions about legal document types or structures" }]
  }
];

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const { theme } = useTheme();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  
  async function getResponse(prompt) {
    try {
      const chat = await model.startChat({ history: systemHistory });
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = await response.text();
      return text;
    } catch (error) {
      console.error("Error in getResponse:", error);
      throw new Error("Failed to get response from AI. Please try again.");
    }
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!prompt.trim()) return;

    setError(null);
    setIsLoading(true);
  
    let chatContent = [...chatHistory];
    chatContent.push({ role: "user", content: md.render(prompt), file: null });
    setChatHistory(chatContent);
    setPrompt("");

    try {
      const aiResponse = await getResponse(prompt);
      chatContent.push({ role: "model", content: md.render(aiResponse) });
      setChatHistory(chatContent);
    } catch (error) {
      setError(error.message || "Something went wrong. Please try again.");
      chatContent.push({
        role: "model",
        content: "❌ " + (error.message || "I encountered an error. Please try again.")
      });
      setChatHistory(chatContent);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setError(null);
    }
  };

  return (
    <>
      <ChatbotButton onClick={toggleChatbot} isOpen={isOpen}>
        {!isOpen ? (
          <>
            <ButtonIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
                <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="currentColor"/>
              </svg>
            </ButtonIcon>
            <ButtonText>Ask LegalAppa</ButtonText>
          </>
        ) : (
          <CloseIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </CloseIcon>
        )}
      </ChatbotButton>

      {isOpen && (
        <ChatbotContainer theme={theme}>
          <ChatbotHeader>
            <HeaderLeft>
              <BotAvatar>
                <img 
                  src={`${process.env.PUBLIC_URL}/legaldad.png`} 
                  alt="LegalAppa" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <AvatarFallback>LA</AvatarFallback>
              </BotAvatar>
              <HeaderInfo>
                <BotName>LegalAppa</BotName>
                <BotStatus>
                  <StatusDot />
                  <StatusText>Online</StatusText>
                </BotStatus>
              </HeaderInfo>
            </HeaderLeft>
            <HeaderActions>
              <MinimizeButton onClick={toggleChatbot}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
                </svg>
              </MinimizeButton>
            </HeaderActions>
          </ChatbotHeader>

          <ChatMessages theme={theme}>
            {chatHistory.length === 0 && (
              <WelcomeMessage theme={theme}>
                <WelcomeIcon>👋</WelcomeIcon>
                <WelcomeTitle theme={theme}>Hello! I'm LegalAppa</WelcomeTitle>
                <WelcomeText theme={theme}>
                  Your AI assistant for legal document drafting. I can help you:
                </WelcomeText>
                <WelcomeList theme={theme}>
                  <li>Draft and edit legal documents</li>
                  <li>Review document structure and formatting</li>
                  <li>Provide suggestions for improvements</li>
                  <li>Answer questions about legal document types</li>
                </WelcomeList>
                <WelcomeNote theme={theme}>
                  ⚠️ Remember: I'm a drafting tool, not a legal advisor. Always consult a qualified lawyer for legal advice.
                </WelcomeNote>
              </WelcomeMessage>
            )}

            {chatHistory.map((chat, index) => {
              const isUserMessage = chat.role === "user";
              return (
                <MessageWrapper key={index} $isUser={isUserMessage}>
                  {isUserMessage ? (
                    <UserMessage>
                      <UserAvatar>
                        <img 
                          src={`${process.env.PUBLIC_URL}/face.svg`} 
                          alt="You"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <AvatarFallback>U</AvatarFallback>
                      </UserAvatar>
                    <MessageContent $isUser={true} theme={theme}>
                      <MessageText
                      dangerouslySetInnerHTML={{ __html: chat.content }}
                      />
                    </MessageContent>
                    </UserMessage>
                  ) : (
                    <BotMessage>
                      <BotAvatarSmall>
                        <img 
                          src={`${process.env.PUBLIC_URL}/legaldad.png`} 
                          alt="LegalAppa"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <AvatarFallback>LA</AvatarFallback>
                      </BotAvatarSmall>
                      <MessageContent $isUser={false} theme={theme}>
                        <MessageText
                      dangerouslySetInnerHTML={{ __html: chat.content }}
                        />
                      </MessageContent>
                    </BotMessage>
                  )}
                </MessageWrapper>
              );
            })}

            {isLoading && (
              <TypingIndicator>
                <BotAvatarSmall>
                  <img 
                    src={`${process.env.PUBLIC_URL}/legaldad.png`} 
                    alt="LegalAppa"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <AvatarFallback>LA</AvatarFallback>
                </BotAvatarSmall>
                <TypingDots theme={theme}>
                  <Dot theme={theme} />
                  <Dot theme={theme} />
                  <Dot theme={theme} />
                </TypingDots>
              </TypingIndicator>
            )}

            {error && (
              <ErrorMessage>
                <ErrorIcon>⚠️</ErrorIcon>
                {error}
              </ErrorMessage>
            )}

            <div ref={chatEndRef} />
          </ChatMessages>

          <ChatInputContainer theme={theme}>
            <ChatForm onSubmit={handleSubmit}>
              <InputWrapper theme={theme}>
                <MessageInput
                  theme={theme}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message..."
                  rows={1}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (prompt.trim()) {
                        handleSubmit(e);
                      }
                    }
                  }}
                />
                <VoiceInputButtonWrapper>
                  <VoiceInput
                    onTranscript={(text) => {
                      setPrompt(prev => prev ? `${prev} ${text}` : text);
                    }}
                    onError={(error) => {
                      setError(error);
                      setTimeout(() => setError(null), 5000);
                    }}
                    disabled={isLoading}
                  />
                </VoiceInputButtonWrapper>
                <SendButton type="submit" disabled={!prompt.trim() || isLoading} theme={theme}>
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                    </svg>
                  )}
                </SendButton>
              </InputWrapper>
            </ChatForm>
          </ChatInputContainer>
        </ChatbotContainer>
      )}
    </>
  );
};

export default Chatbot;

// Styled Components
const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const ChatbotButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  animation: ${props => props.isOpen ? slideDown : slideUp} 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    padding: 12px 20px;
    font-size: 14px;
  }
`;

const ButtonIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.span``;

const CloseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 420px;
  height: 600px;
  max-height: calc(100vh - 48px);
  background: ${props => props.theme === 'dark' ? '#1E293B' : '#F9FAFB'};
  border-radius: 20px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 20px 60px rgba(0, 0, 0, 0.3)'};
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  display: flex;
  flex-direction: column;
  z-index: 1001;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: calc(100vw - 32px);
    height: calc(100vh - 32px);
    max-height: calc(100vh - 32px);
    bottom: 16px;
    right: 16px;
    border-radius: 16px;
  }
`;

const ChatbotHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BotAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BotAvatarSmall = styled(BotAvatar)`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: none;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BotName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const BotStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const StatusText = styled.span``;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MinimizeButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${props => props.theme === 'dark' ? '#0F172A' : '#F9FAFB'};
  transition: background-color 0.3s ease;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#475569' : '#CBD5E1'};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme === 'dark' ? '#64748B' : '#94A3B8'};
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const UserMessage = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
  flex-direction: row-reverse;
`;

const BotMessage = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
`;

const UserAvatar = styled(BotAvatarSmall)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MessageContent = styled.div`
  background: ${props => props.$isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : props.theme === 'dark' ? '#1E293B' : '#F3F4F6'};
  color: ${props => props.$isUser ? 'white' : props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  padding: 12px 16px;
  border-radius: ${props => props.$isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  border: ${props => !props.$isUser ? `1px solid ${props.theme === 'dark' ? '#334155' : '#D1D5DB'}` : 'none'};
  word-wrap: break-word;
  line-height: 1.5;
  transition: all 0.3s ease;

  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  strong {
    font-weight: 600;
  }

  code {
    background: ${props => props.$isUser 
      ? 'rgba(0, 0, 0, 0.2)' 
      : props.theme === 'dark' ? '#0F172A' : '#F1F5F9'};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
`;

const MessageText = styled.div`
  a {
    color: inherit;
    text-decoration: underline;
  }
`;


const WelcomeMessage = styled.div`
  background: ${props => props.theme === 'dark' ? '#1E293B' : '#F3F4F6'};
  padding: 24px;
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#D1D5DB'};
  text-align: center;
  transition: all 0.3s ease;
`;

const WelcomeIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const WelcomeTitle = styled.h3`
  margin: 0 0 12px 0;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 20px;
  font-weight: 600;
  transition: color 0.3s ease;
`;

const WelcomeText = styled.p`
  margin: 0 0 16px 0;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  font-size: 14px;
  transition: color 0.3s ease;
`;

const WelcomeList = styled.ul`
  text-align: left;
  margin: 0 0 16px 0;
  padding-left: 20px;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
  font-size: 14px;
  transition: color 0.3s ease;

  li {
    margin: 8px 0;
  }
`;

const WelcomeNote = styled.p`
  margin: 16px 0 0 0;
  padding: 12px;
  background: ${props => props.theme === 'dark' ? '#1E293B' : '#FEF3C7'};
  border-left: 3px solid ${props => props.theme === 'dark' ? '#FBBF24' : '#F59E0B'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#FCD34D' : '#92400E'};
  font-size: 12px;
  text-align: left;
  transition: all 0.3s ease;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: ${props => props.theme === 'dark' ? '#1E293B' : '#F3F4F6'};
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#D1D5DB'};
  border-radius: 18px 18px 18px 4px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme === 'dark' ? '#818CF8' : '#94A3B8'};
  animation: ${pulse} 1.4s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee2e2;
  border-left: 3px solid #ef4444;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
  margin: 8px 0;
`;

const ErrorIcon = styled.span`
  font-size: 16px;
`;

const ChatInputContainer = styled.div`
  padding: 16px;
  background: ${props => props.theme === 'dark' ? '#1E293B' : '#F9FAFB'};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  transition: all 0.3s ease;
`;


const ChatForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const VoiceInputButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: ${props => props.theme === 'dark' ? '#0F172A' : '#F9FAFB'};
  border: 2px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 24px;
  padding: 8px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: ${props => props.theme === 'dark' ? '#818CF8' : '#667EEA'};
    background: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
  }
`;


const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  padding: 8px 12px;
  font-size: 14px;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-family: inherit;
  max-height: 120px;
  overflow-y: auto;
  transition: color 0.3s ease;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#64748B' : '#9CA3AF'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #818CF8 0%, #A78BFA 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 8px rgba(129, 140, 248, 0.3)' 
    : '0 2px 8px rgba(102, 126, 234, 0.3)'};

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 4px 12px rgba(129, 140, 248, 0.5)' 
      : '0 4px 12px rgba(102, 126, 234, 0.4)'};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
