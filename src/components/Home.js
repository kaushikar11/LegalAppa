import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { useTheme } from '../contexts/themeContext';

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
    background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFF8E7'};
    color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();

    const handleCTAClick = () => {
        if (currentUser) {
            navigate('/upload');
        } else {
            navigate('/login');
        }
    };
  return (
    <>
      <GlobalStyle theme={theme} />
      <HomeContainer>
        <HeroSection theme={theme}>
          <Title theme={theme}>
          {currentUser ? `Welcome back, ${currentUser.displayName || currentUser.email}` : 'Legal Appa'}
          </Title>
          <Subtitle theme={theme}>Stop spending hours on one document—draft hundreds in just 10 minutes!</Subtitle>
          <CTAButton theme={theme} onClick={handleCTAClick}>
            {currentUser ? 'Start Drafting' : 'Get Started Free'}
          </CTAButton>
        </HeroSection>

        <FeaturesSection theme={theme}>
          <SectionTitle theme={theme}>Explore Our Key Features</SectionTitle>
          <FeatureGrid>
            <FeatureCard theme={theme}>
              <FeatureIcon>📄</FeatureIcon>
              <FeatureTitle theme={theme}>AI-Powered Drafting</FeatureTitle>
              <FeatureDescription theme={theme}>Create legal documents in a flash with advanced AI assistance & top notch accuracy!</FeatureDescription>
            </FeatureCard>
            <FeatureCard theme={theme}>
              <FeatureIcon>ஆ</FeatureIcon>
              <FeatureTitle theme={theme}>Multilingual Translation</FeatureTitle>
              <FeatureDescription theme={theme}>Draft documents in your preferred language and seamlessly translate them into English with exceptional precision</FeatureDescription>
            </FeatureCard>
            <FeatureCard theme={theme}>
              <FeatureIcon>⚖️</FeatureIcon>
              <FeatureTitle theme={theme}>Legal Compliance</FeatureTitle>
              <FeatureDescription theme={theme}>Ensure documents meet legal standards across jurisdictions</FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </FeaturesSection>

        <HowItWorksSection theme={theme}>
          <SectionTitle theme={theme}>Discover How It Works</SectionTitle>
          <StepGrid>
            <StepCard>
              <StepNumber theme={theme}>1</StepNumber>
              <StepTitle theme={theme}>Input Requirements</StepTitle>
              <StepDescription theme={theme}>Provide basic information about your legal document needs</StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber theme={theme}>2</StepNumber>
              <StepTitle theme={theme}>AI Generation</StepTitle>
              <StepDescription theme={theme}>Our AI creates a tailored draft based on your inputs</StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber theme={theme}>3</StepNumber>
              <StepTitle theme={theme}>Review & Finalize</StepTitle>
              <StepDescription theme={theme}>Review, edit, and finalize your document with ease</StepDescription>
            </StepCard>
          </StepGrid>
        </HowItWorksSection>

        <TestimonialSection theme={theme}>
          <SectionTitle theme={theme}>What Our Clients Say</SectionTitle>
          <TestimonialCard theme={theme}>
            <TestimonialText theme={theme}>"Legal Appa has revolutionized our contract drafting process. It's a game-changer!"</TestimonialText>
            <TestimonialAuthor theme={theme}>- Jane Doe, Legal Counsel at Tech Corp</TestimonialAuthor>
          </TestimonialCard>
        </TestimonialSection>
      </HomeContainer>
    </>
  );
};

export default Home;

// Styled components
const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 0;
  position: relative;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1E293B 50%, #0F172A 50%)' 
    : 'linear-gradient(135deg, #E8E3D3 50%, #DDD6C7 50%)'};
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  clip-path: polygon(0 0, 100% 15%, 100% 100%, 0% 100%);
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  animation: fadeIn 1s ease-in-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  letter-spacing: -0.03em;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  animation: fadeIn 1.5s ease-in-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
  font-weight: 400;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CTAButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
  color: white;
  font-size: 1.125rem;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 14px rgba(99, 102, 241, 0.4)' 
    : '0 4px 14px rgba(59, 130, 246, 0.4)'};

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4F46E5' : '#2563EB'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
      : '0 6px 20px rgba(59, 130, 246, 0.5)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 2.25rem;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  padding-bottom: 0.75rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  letter-spacing: -0.02em;

  &:after {
    content: '';
    width: 60px;
    height: 3px;
    background: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 0;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1E293B 50%, #0F172A 50%)' 
    : 'linear-gradient(135deg, #DDD6C7 50%, #D3CDC0 50%)'};
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#F5F0E8'};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5DED0'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 8px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
      : '0 8px 20px rgba(0, 0, 0, 0.15)'};
    background-color: ${props => props.theme === 'dark' ? '#334155' : '#EBE5D8'};
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
`;

const HowItWorksSection = styled.section`
  padding: 4rem 0;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0F172A 50%, #1E293B 50%)' 
    : 'linear-gradient(135deg, #E8E3D3 50%, #DDD6C7 50%)'};
  clip-path: polygon(0 0, 100% 15%, 100% 100%, 0% 100%);
`;

const StepGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const StepCard = styled.div`
  text-align: center;
`;

const StepNumber = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 14px rgba(99, 102, 241, 0.4)' 
    : '0 4px 14px rgba(59, 130, 246, 0.4)'};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const StepTitle = styled.h3`
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StepDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
`;

const TestimonialSection = styled.section`
  padding: 4rem 0;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1E293B 50%, #0F172A 50%)' 
    : 'linear-gradient(135deg, #DDD6C7 50%, #D3CDC0 50%)'};
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
`;

const TestimonialCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#F5F0E8'};
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5DED0'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 8px 20px rgba(0, 0, 0, 0.4)' 
      : '0 8px 20px rgba(0, 0, 0, 0.15)'};
  }
`;

const TestimonialText = styled.p`
  font-style: italic;
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  margin-bottom: 1rem;
`;

const TestimonialAuthor = styled.p`
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
`;