import React from 'react';
import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
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
  background-color: #333;
  color: white;
  padding: 2rem 0;
  text-align: center;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  font-family: 'Arial', sans-serif;
`;

const FooterNav = styled.nav`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FooterLink = styled.a`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s;

  &:hover {
    color: #ffcc00; /* Accent color */
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SocialIcon = styled.a`
  color: white;
  font-size: 1.5rem;
  transition: color 0.3s;

  &:hover {
    color: #ffcc00; /* Accent color */
  }
`;

const LegalText = styled.p`
  font-size: 0.875rem;
  color: #ccc;
`;