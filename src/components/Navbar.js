import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage the hamburger menu toggle
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useAuth();

  // Hide the navbar links on the login and register pages
  const hideLinks = location.pathname === '/home' || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Nav>
      <NavContainer>
        <LogoLink to="/">
          <Logo src={`${process.env.PUBLIC_URL}/logo512.png`} alt="Logo" />
          <LogoTitle>LegalAppa</LogoTitle>
        </LogoLink>
        {currentUser && (
          <>
          <UserName>
            {currentUser.displayName ? currentUser.displayName : currentUser.email}
          </UserName>
        </>
        )}
        {!hideLinks && (
          <>
            <Hamburger onClick={toggleMenu}>
              <span />
              <span />
              <span />
            </Hamburger>
            <NavLinks isOpen={isOpen}>
              <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
              <NavLink to="/upload" onClick={toggleMenu}>Upload</NavLink>
              <NavLink to="/templates" onClick={toggleMenu}>Generate</NavLink>
              
            </NavLinks>
          </>
        )}
        {currentUser && (
          <>
        <LogoutButton
                onClick={() => {
                  doSignOut().then(() => {
                    navigate('/home');
                  });
                }}
              >
                Logout
              </LogoutButton>
              </>
              )}
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

const Nav = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
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

const LogoTitle = styled.span`
  font-weight: bold;
  color: #333;
  font-size: 1.5rem; /* Adjust font size if needed */
`;

const Logo = styled.img`
  height: 60px;
  margin-right: 10px;
`;

const Hamburger = styled.div`
  display: none;
  flex-direction: column;
  cursor: pointer;

  span {
    height: 3px;
    width: 25px;
    background-color: #333;
    margin-bottom: 4px;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 1rem;
    gap: 0.5rem;
    transition: max-height 0.3s ease-in-out;
    max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
    overflow: hidden;
    z-index: 999;
  }
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

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const UserName = styled.div`
  color: #333;
  font-weight: 500;
  margin-right: 1rem;
`;

const LogoutButton = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;
