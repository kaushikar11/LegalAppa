import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { currentUser } = useAuth();
  // Hide the navbar links on the login and register pages
  const hideLinks = location.pathname === '/home' || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <Nav>
      <NavContainer>
        <LogoLink to="/">
          <Logo src={`${process.env.PUBLIC_URL}/logo512.png`} alt="Logo" />
        </LogoLink>
        {!hideLinks && (
          <NavLinks>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/upload">Upload</NavLink>
            <NavLink to="/templates">Generate</NavLink>
            <UserName>
              {currentUser.displayName ? currentUser.displayName : currentUser.email}
            </UserName>
            <LogoutButton
              onClick={() => {
                doSignOut().then(() => {
                  navigate('/home');
                });
              }}
            >
              Logout
            </LogoutButton>
          </NavLinks>
        )}
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

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
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

const UserName = styled.div`
  color: #333; /* Dark color for better readability */
  font-weight: 500;
  margin-right: 1rem; /* Spacing between user name and logout button */
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
`;
