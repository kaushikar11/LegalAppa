import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { useTheme } from '../contexts/themeContext';
import { doSignOut } from '../firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Hide the navbar links on the login and register pages
  const hideLinks = location.pathname === '/home' || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  // Apple-style scroll effect - glass morphism when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Nav theme={theme} isScrolled={isScrolled}>
      <NavContainer>
        <LogoLink to="/" theme={theme}>
          <Logo src={`${process.env.PUBLIC_URL}/logo512.png`} alt="Logo" />
          <LogoTitle theme={theme}>LegalAppa</LogoTitle>
        </LogoLink>
        {currentUser && (
          <>
          <UserName theme={theme}>
            {currentUser.displayName ? currentUser.displayName : currentUser.email}
          </UserName>
        </>
        )}
        {!hideLinks && (
          <>
            <Hamburger onClick={toggleMenu} theme={theme}>
              <span />
              <span />
              <span />
            </Hamburger>
            <NavLinks isOpen={isOpen} theme={theme}>
              <NavLink to="/" onClick={toggleMenu} theme={theme}>Home</NavLink>
              <NavLink to="/upload" onClick={toggleMenu} theme={theme}>Upload</NavLink>
              <NavLink to="/templates" onClick={toggleMenu} theme={theme}>Generate</NavLink>
              
            </NavLinks>
          </>
        )}
        <NavActions>
          <ThemeToggleButton onClick={toggleTheme} theme={theme}>
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V4.5C12.75 4.91421 12.4142 5.25 12 5.25C11.5858 5.25 11.25 4.91421 11.25 4.5V3C11.25 2.58579 11.5858 2.25 12 2.25Z" fill="currentColor"/>
                <path d="M12 18.75C12.4142 18.75 12.75 19.0858 12.75 19.5V21C12.75 21.4142 12.4142 21.75 12 21.75C11.5858 21.75 11.25 21.4142 11.25 21V19.5C11.25 19.0858 11.5858 18.75 12 18.75Z" fill="currentColor"/>
                <path d="M18.75 12C18.75 11.5858 19.0858 11.25 19.5 11.25H21C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75H19.5C19.0858 12.75 18.75 12.4142 18.75 12Z" fill="currentColor"/>
                <path d="M2.25 12C2.25 11.5858 2.58579 11.25 3 11.25H4.5C4.91421 11.25 5.25 11.5858 5.25 12C5.25 12.4142 4.91421 12.75 4.5 12.75H3C2.58579 12.75 2.25 12.4142 2.25 12Z" fill="currentColor"/>
                <path d="M17.4697 6.53033C17.7626 6.82322 18.2374 6.82322 18.5303 6.53033C18.8232 6.23744 18.8232 5.76256 18.5303 5.46967L17.4697 4.40901C17.1768 4.11612 16.7019 4.11612 16.409 4.40901C16.1161 4.7019 16.1161 5.17678 16.409 5.46967L17.4697 6.53033Z" fill="currentColor"/>
                <path d="M7.59099 16.409C7.2981 16.1161 6.82322 16.1161 6.53033 16.409C6.23744 16.7019 6.23744 17.1768 6.53033 17.4697L7.59099 18.5303C7.88388 18.8232 8.35876 18.8232 8.65165 18.5303C8.94454 18.2374 8.94454 17.7626 8.65165 17.4697L7.59099 16.409Z" fill="currentColor"/>
                <path d="M18.5303 17.4697C18.8232 17.7626 18.8232 18.2374 18.5303 18.5303C18.2374 18.8232 17.7626 18.8232 17.4697 18.5303L16.409 17.4697C16.1161 17.1768 16.1161 16.7019 16.409 16.409C16.7019 16.1161 17.1768 16.1161 17.4697 16.409L18.5303 17.4697Z" fill="currentColor"/>
                <path d="M6.53033 6.53033C6.82322 6.23744 6.82322 5.76256 6.53033 5.46967C6.23744 5.17678 5.76256 5.17678 5.46967 5.46967L4.40901 6.53033C4.11612 6.82322 4.11612 7.2981 4.40901 7.59099C4.7019 7.88388 5.17678 7.88388 5.46967 7.59099L6.53033 6.53033Z" fill="currentColor"/>
                <path d="M12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.52844 2.91003C9.78869 3.50326 9.64647 4.20043 9.15369 4.64482C8.66091 5.08922 7.94229 5.17559 7.34906 4.91534C6.75583 4.65508 6.36111 4.09771 6.40096 3.48477C6.44081 2.87183 6.90826 2.35703 7.5212 2.31718C8.13414 2.27733 8.69151 2.67205 8.95176 3.26528L9.52844 2.91003Z" fill="currentColor"/>
                <path d="M16.6509 4.91534C16.0577 5.17559 15.3391 5.08922 14.8463 4.64482C14.3535 4.20043 14.2113 3.50326 14.4716 2.91003L15.0482 3.26528C15.3085 2.67205 15.8659 2.27733 16.4788 2.31718C17.0917 2.35703 17.5592 2.87183 17.599 3.48477C17.6389 4.09771 17.2442 4.65508 16.6509 4.91534Z" fill="currentColor"/>
                <path d="M19.0603 8.11091C18.7821 8.47929 18.3459 8.68421 17.8862 8.66284C17.4265 8.64147 17.0115 8.39674 16.7684 8.01003C16.5253 7.62332 16.4856 7.14318 16.6622 6.72265C16.8388 6.30212 17.2105 5.99316 17.6562 5.88803C18.1019 5.7829 18.5672 5.89316 18.9136 6.18603C19.26 6.4789 19.4472 6.92003 19.4144 7.37003C19.3816 7.82003 19.1322 8.22203 18.75 8.47003L19.0603 8.11091Z" fill="currentColor"/>
                <path d="M5.23164 8.01003C4.98854 8.39674 4.57355 8.64147 4.11384 8.66284C3.65413 8.68421 3.21795 8.47929 2.9397 8.11091L3.25 8.47003C2.86784 8.22203 2.61836 7.82003 2.58558 7.37003C2.5528 6.92003 2.73998 6.4789 3.08638 6.18603C3.43278 5.89316 3.89812 5.7829 4.34381 5.88803C4.7895 5.99316 5.16118 6.30212 5.33778 6.72265C5.51438 7.14318 5.47474 7.62332 5.23164 8.01003Z" fill="currentColor"/>
                <path d="M21 13.25C21.4142 13.25 21.75 13.5858 21.75 14C21.75 14.4142 21.4142 14.75 21 14.75C20.5858 14.75 20.25 14.4142 20.25 14C20.25 13.5858 20.5858 13.25 21 13.25Z" fill="currentColor"/>
                <path d="M3 13.25C3.41421 13.25 3.75 13.5858 3.75 14C3.75 14.4142 3.41421 14.75 3 14.75C2.58579 14.75 2.25 14.4142 2.25 14C2.25 13.5858 2.58579 13.25 3 13.25Z" fill="currentColor"/>
                <path d="M18.5303 19.4697C18.8232 19.7626 18.8232 20.2374 18.5303 20.5303C18.2374 20.8232 17.7626 20.8232 17.4697 20.5303L16.409 19.4697C16.1161 19.1768 16.1161 18.7019 16.409 18.409C16.7019 18.1161 17.1768 18.1161 17.4697 18.409L18.5303 19.4697Z" fill="currentColor"/>
                <path d="M6.53033 19.4697C6.23744 19.1768 5.76256 19.1768 5.46967 19.4697C5.17678 19.7626 5.17678 20.2374 5.46967 20.5303L6.53033 21.5909C6.82322 21.8838 7.2981 21.8838 7.59099 21.5909C7.88388 21.298 7.88388 20.8232 7.59099 20.5303L6.53033 19.4697Z" fill="currentColor"/>
                <path d="M12 18.25C15.4518 18.25 18.25 15.4518 18.25 12C18.25 8.54822 15.4518 5.75 12 5.75C8.54822 5.75 5.75 8.54822 5.75 12C5.75 15.4518 8.54822 18.25 12 18.25Z" fill="currentColor"/>
              </svg>
            )}
          </ThemeToggleButton>
          {currentUser && (
            <LogoutButton
              onClick={() => {
                doSignOut().then(() => {
                  navigate('/');
                });
              }}
            >
              Logout
            </LogoutButton>
          )}
        </NavActions>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => {
    if (props.isScrolled) {
      // Glass morphism effect when scrolled
      return props.theme === 'dark' 
        ? 'rgba(15, 23, 42, 0.8)' 
        : 'rgba(255, 248, 231, 0.8)';
    }
    // Solid background when at top
    return props.theme === 'dark' ? '#0F172A' : '#FFF8E7';
  }};
  backdrop-filter: ${props => props.isScrolled ? 'blur(20px) saturate(180%)' : 'none'};
  -webkit-backdrop-filter: ${props => props.isScrolled ? 'blur(20px) saturate(180%)' : 'none'};
  box-shadow: ${props => props.isScrolled 
    ? `0 4px 30px rgba(0, 0, 0, ${props.theme === 'dark' ? '0.3' : '0.1'})`
    : 'none'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid ${props => props.theme === 'dark' 
    ? (props.isScrolled ? 'rgba(51, 65, 85, 0.5)' : '#334155')
    : (props.isScrolled ? 'rgba(229, 231, 235, 0.5)' : '#E5E7EB')};
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
`;

const LogoTitle = styled.span`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-size: 1.375rem;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
    background-color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
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
    background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
    padding: 1rem;
    gap: 0.5rem;
    transition: max-height 0.3s ease-in-out;
    max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
    overflow: hidden;
    z-index: 999;
    border-bottom: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  text-decoration: none;
  font-weight: 400;
  font-size: 0.9375rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  letter-spacing: -0.01em;

  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.theme === 'dark' ? '#FFFFFF' : '#000000'};
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 0.75rem 1rem;
  }
`;

const UserName = styled.div`
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  font-weight: 500;
  margin-right: 1rem;
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ThemeToggleButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#334155' : '#F3F4F6'};
  border: 1px solid ${props => props.theme === 'dark' ? '#475569' : '#E5E7EB'};
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#FBBF24' : '#F59E0B'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#475569' : '#E5E7EB'};
    transform: scale(1.05);
    border-color: ${props => props.theme === 'dark' ? '#64748B' : '#D1D5DB'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LogoutButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#1E40AF' : '#3B82F6'};
  color: #fff;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#1E3A8A' : '#2563EB'};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;
