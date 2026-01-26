import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth';
import { useAuth } from '../../../contexts/authContext';
import { useTheme } from '../../../contexts/themeContext';
import styled from 'styled-components';
import legaldad from '../../../assets/legaldad.png';

const Login = () => {
    const { userLoggedIn } = useAuth();
    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear any previous error messages

        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(email, password);
            } catch (error) {
                setErrorMessage(error.code);
                switch (error.code) {
                    case 'auth/invalid-credential':
                        setErrorMessage('Invalid email or password');
                        break;
                    case 'auth/user-disabled':
                        setErrorMessage('User account is disabled');
                        break;
                    default:
                        setErrorMessage('Failed to sign in. Please try again.');
                }
                setIsSigningIn(false);
            }
        }
    };

    const onGoogleSignIn = (e) => {
        e.preventDefault();
        setErrorMessage('');
        if (!isSigningIn) {
            setIsSigningIn(true);
            doSignInWithGoogle().catch((err) => {
                setIsSigningIn(false);
            });
        }
    };

    return (
        <>
            {userLoggedIn && (<Navigate to={'/upload'} replace={true} />)}

            <LoginContainer theme={theme}>
                <LoginCard theme={theme}>
                    <LogoContainer>
                        <LogoImage src={legaldad} alt="Logo" />  
                    </LogoContainer>
                   
                    <TitleContainer> 
                        <Title theme={theme}>Welcome Back</Title>
                    </TitleContainer>
                    <LoginForm onSubmit={onSubmit}>
                        <FormGroup>
                            <Label theme={theme}>Email</Label>
                            <Input
                                type="email"
                                autoComplete='email'
                                required
                                value={email} 
                                onChange={(e) => { setEmail(e.target.value) }}
                                theme={theme}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label theme={theme}>Password</Label>
                            <Input
                                type="password"
                                autoComplete='current-password'
                                required
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value) }}
                                theme={theme}
                            />
                        </FormGroup>

                        {errorMessage && (
                            <ErrorMessage>{errorMessage}</ErrorMessage>
                        )}

                        <SubmitButton
                            type="submit"
                            disabled={isSigningIn}
                            theme={theme}
                            isSigningIn={isSigningIn}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </SubmitButton>

                    </LoginForm>
                    <SignUpLink theme={theme}>
                        Don't have an account? <StyledLink to={'/register'} theme={theme}>Sign up</StyledLink>
                    </SignUpLink>
                    <Divider theme={theme}>
                        <DividerLine theme={theme}></DividerLine>
                        <DividerText theme={theme}>OR</DividerText>
                        <DividerLine theme={theme}></DividerLine>
                    </Divider>
                    <GoogleButton
                        disabled={isSigningIn}
                        onClick={(e) => { onGoogleSignIn(e) }}
                        theme={theme}
                        isSigningIn={isSigningIn}
                    >
                        <GoogleIcon viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_17_40)">
                                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13" fill="#EA4335" />
                            </g>
                            <defs>
                                <clipPath id="clip0_17_40">
                                    <rect width="48" height="48" fill="white" />
                                </clipPath>
                            </defs>
                        </GoogleIcon>
                        Sign in with Google
                    </GoogleButton>
                </LoginCard>
            </LoginContainer>
        </>
    );
};

export default Login;

// Styled Components
const LoginContainer = styled.main`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFF8E7'};
  transition: background-color 0.3s ease;
  padding-top: 80px;
`;

const LoginCard = styled.div`
  width: 420px;
  padding: 2.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 20px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 20px 32px rgba(0, 0, 0, 0.08)'};
  transition: all 0.3s ease;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const LogoImage = styled.img`
  height: 80px;
`;

const TitleContainer = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  margin: 0.5rem 0 0 0;
  transition: color 0.3s ease;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
`;

const Input = styled.input`
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.875rem 1rem;
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFFFFF'};
  border: 2px solid ${props => props.theme === 'dark' ? '#334155' : '#E5E7EB'};
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  &:focus {
    border-color: ${props => props.theme === 'dark' ? '#6366F1' : '#3B82F6'};
    background-color: ${props => props.theme === 'dark' ? '#1E293B' : '#FFFFFF'};
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 0 0 3px rgba(99, 102, 241, 0.1)' 
      : '0 0 0 3px rgba(59, 130, 246, 0.1)'};
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#64748B' : '#9CA3AF'};
  }
`;

const ErrorMessage = styled.span`
  color: #EF4444;
  font-weight: 700;
  font-size: 0.875rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: ${props => props.isSigningIn ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background-color: ${props => props.isSigningIn 
    ? (props.theme === 'dark' ? '#475569' : '#9CA3AF')
    : (props.theme === 'dark' ? '#6366F1' : '#3B82F6')};
  color: white;
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  box-shadow: ${props => !props.isSigningIn 
    ? (props.theme === 'dark' 
      ? '0 4px 14px rgba(99, 102, 241, 0.4)' 
      : '0 4px 14px rgba(59, 130, 246, 0.4)')
    : 'none'};

  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#4F46E5' : '#2563EB'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 20px rgba(99, 102, 241, 0.5)' 
      : '0 6px 20px rgba(59, 130, 246, 0.5)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const SignUpLink = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  margin-top: 1rem;
  transition: color 0.3s ease;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme === 'dark' ? '#818CF8' : '#667EEA'};
  font-weight: 700;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    text-decoration: underline;
    color: ${props => props.theme === 'dark' ? '#A78BFA' : '#818CF8'};
  }
`;

const Divider = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin: 1rem 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 2px;
  background-color: ${props => props.theme === 'dark' ? '#334155' : '#D1D5DB'};
  margin: 0 0.5rem;
  transition: background-color 0.3s ease;
`;

const DividerText = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#6B7280'};
  padding: 0 0.5rem;
  transition: color 0.3s ease;
`;

const GoogleButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.625rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#334155' : '#D1D5DB'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: ${props => props.isSigningIn ? 'not-allowed' : 'pointer'};
  color: ${props => props.theme === 'dark' ? '#F1F5F9' : '#1F2937'};
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFFFFF'};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#334155' : '#F3F4F6'};
    border-color: ${props => props.theme === 'dark' ? '#475569' : '#D1D5DB'};
  }

  &:active:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#475569' : '#E5E7EB'};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const GoogleIcon = styled.svg`
  width: 20px;
  height: 20px;
`;
