import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Home = () => {
  return (
    <>
      <GlobalStyle />
      <HomeContainer>
        <HeroSection>
          <Title>Legal Appa</Title>
          <Subtitle>Stop spending hours on one document—draft hundreds in just 10 minutes!</Subtitle>
          <CTAButton>Get Started Free</CTAButton>
        </HeroSection>

        <FeaturesSection>
          <SectionTitle>Explore Our Key Features</SectionTitle>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>📄</FeatureIcon>
              <FeatureTitle>AI-Powered Drafting</FeatureTitle>
              <FeatureDescription>Create legal documents in a flash with advanced AI assistance & top notch accuracy!</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>ஆ</FeatureIcon>
              <FeatureTitle>Multilingual Translation</FeatureTitle>
              <FeatureDescription>Draft documents in your preferred language and seamlessly translate them into English with exceptional precision</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>⚖️</FeatureIcon>
              <FeatureTitle>Legal Compliance</FeatureTitle>
              <FeatureDescription>Ensure documents meet legal standards across jurisdictions</FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </FeaturesSection>

        <HowItWorksSection>
          <SectionTitle>Discover How It Works</SectionTitle>
          <StepGrid>
            <StepCard>
              <StepNumber>1</StepNumber>
              <StepTitle>Input Requirements</StepTitle>
              <StepDescription>Provide basic information about your legal document needs</StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>2</StepNumber>
              <StepTitle>AI Generation</StepTitle>
              <StepDescription>Our AI creates a tailored draft based on your inputs</StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>3</StepNumber>
              <StepTitle>Review & Finalize</StepTitle>
              <StepDescription>Review, edit, and finalize your document with ease</StepDescription>
            </StepCard>
          </StepGrid>
        </HowItWorksSection>

        <TestimonialSection>
          <SectionTitle>What Our Clients Say</SectionTitle>
          <TestimonialCard>
            <TestimonialText>"Legal Appa has revolutionized our contract drafting process. It's a game-changer!"</TestimonialText>
            <TestimonialAuthor>- Jane Doe, Legal Counsel at Tech Corp</TestimonialAuthor>
          </TestimonialCard>
        </TestimonialSection>

        <CTASection>
          <CTATitle>Ready to Transform Your Legal Drafting?</CTATitle>
          <CTAButton>Start Your Free Trial</CTAButton>
        </CTASection>
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
  background: #f0f0f0;
  color: #333;
  position: relative;
  padding: 4rem 0;
  background: linear-gradient(135deg, #e6e6e6 50%, #f8f8f8 50%);
  clip-path: polygon(0 0, 100% 15%, 100% 100%, 0% 100%);
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  animation: fadeIn 1s ease-in-out;
  font-family: 'Arial', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  animation: fadeIn 1.5s ease-in-out;
  font-family: 'Arial', sans-serif;
`;

const CTAButton = styled.button`
  background-color: #333;
  color: white;
  font-size: 1.2rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #555;
    transform: scale(1.05);
  }
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 0.5rem;

  &:after {
    content: '';
    width: 50px;
    height: 4px;
    background: #333;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 0;
  background: linear-gradient(135deg, #f8f8f8 50%, #e6e6e6 50%);
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #666;
`;

const HowItWorksSection = styled.section`
  padding: 4rem 0;
  background: linear-gradient(135deg, #e6e6e6 50%, #f8f8f8 50%);
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
  background-color: #333;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  font-weight: bold;
`;

const StepTitle = styled.h3`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StepDescription = styled.p`
  color: #666;
`;

const TestimonialSection = styled.section`
  padding: 4rem 0;
  background-color: #f8f8f8;
  padding: 4rem 0;
  background: linear-gradient(135deg, #f8f8f8 50%, #e6e6e6 50%);
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
`;

const TestimonialCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const TestimonialText = styled.p`
  font-style: italic;
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const TestimonialAuthor = styled.p`
  color: #666;
`;

const CTASection = styled.section`
  text-align: center;
  padding: 4rem 0;
`;

const CTATitle = styled.h2`
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 2rem;
`;