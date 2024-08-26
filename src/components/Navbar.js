// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../logo.svg';

const Navbar = () => {
  return (
    <Nav>
      <NavContainer>
        <LogoLink to="/">
        <Logo src={`${process.env.PUBLIC_URL}/logo512.png`} alt="Logo" />
          
        </LogoLink>
        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/upload">Samples</NavLink>
          <NavLink to="/templates">Generate</NavLink>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

const Nav = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
`;

const Logo = styled.img`
  height: 60px;
  margin-right: 10px;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }
`;