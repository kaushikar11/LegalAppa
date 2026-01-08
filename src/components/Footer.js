import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/themeContext';

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <FooterContainer theme={theme}>
      <FooterContent>
        <Logo>Legal Appa</Logo>
        <FooterNav>
          <FooterLink href="#features">Features</FooterLink>
          <FooterLink href="#how-it-works">How It Works</FooterLink>
          <FooterLink href="#testimonials">Testimonials</FooterLink>
          <FooterLink href="#pricing">Pricing</FooterLink>
          <FooterLink href="#contact">Contact</FooterLink>
        </FooterNav>
        <SocialIcons>
          <SocialIcon href="#"><i className="fab fa-twitter"></i></SocialIcon>
          <SocialIcon href="https://www.linkedin.com/company/legalappa/"><i className="fab fa-linkedin"></i></SocialIcon>
          <SocialIcon href="#"><i className="fab fa-facebook"></i></SocialIcon>
        </SocialIcons>
        <LegalText>
          &copy; {new Date().getFullYear()} Legal Appa. All rights reserved.
        </LegalText>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;

// Styled Components

const FooterContainer = styled.footer`
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#E8E3D3'};
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  padding: 3rem 2rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#D3CDC0'};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.h2`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  letter-spacing: -0.02em;
`;

const FooterNav = styled.nav`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FooterLink = styled.a`
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#4B5563'};
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 400;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#818CF8' : '#3B82F6'};
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SocialIcon = styled.a`
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  font-size: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#818CF8' : '#3B82F6'};
    transform: translateY(-2px);
  }
`;

const LegalText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#94A3B8' : '#6B7280'};
  margin-top: 1rem;
`;