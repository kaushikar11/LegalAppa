import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { useTheme } from '../../../contexts/themeContext';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';
import styled from 'styled-components';
import legaldad from '../../../assets/legaldad.png';

const Register = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { userLoggedIn } = useAuth();

    const validatePassword = (password) => {
        const minLength = 6;
        const alphanumerical = /^(?=.*[A-Za-z])(?=.*\d)/;
        const specialCharacter = /[@$!%*#?&]/;

        if (password.length < minLength) {
            return 'Password must be at least 6 characters long';
        }
        if (!alphanumerical.test(password)) {
            return 'Password must contain at least one number';
        }
        if (!specialCharacter.test(password)) {
            return 'Password must contain at least one special character';
        }
        return '';
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear any previous error messages

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setErrorMessage(passwordError);
            return;
        }

        if (!isRegistering) {
            setIsRegistering(true);
            try {
                await doCreateUserWithEmailAndPassword(email, password);
                navigate('/upload'); // Redirect to home after successful registration
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    setErrorMessage('Email is already in use');
                } else {
                    setErrorMessage('Failed to create an account. Please try again.');
                }
                setIsRegistering(false);
            }
        }
    };

    return (
        <>
            {userLoggedIn && <Navigate to="/upload" replace={true} />}

            <RegisterContainer theme={theme}>
                <RegisterCard theme={theme}>
                    <LogoContainer>
                        <LogoImage src={legaldad} alt="Logo" />  
                    </LogoContainer>
                   
                    <TitleContainer>
                        <Title theme={theme}>Create a New Account</Title>
                    </TitleContainer>
                    <RegisterForm onSubmit={onSubmit}>
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
                                disabled={isRegistering}
                                type="password"
                                autoComplete='new-password'
                                required
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value) }}
                                theme={theme}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label theme={theme}>Confirm Password</Label>
                            <Input
                                disabled={isRegistering}
                                type="password"
                                autoComplete='off'
                                required
                                value={confirmPassword} 
                                onChange={(e) => { setConfirmPassword(e.target.value) }}
                                theme={theme}
                            />
                        </FormGroup>

                        {errorMessage && (
                            <ErrorMessage>{errorMessage}</ErrorMessage>
                        )}

                        <SubmitButton
                            type="submit"
                            disabled={isRegistering}
                            theme={theme}
                            isRegistering={isRegistering}
                        >
                            {isRegistering ? 'Signing Up...' : 'Sign Up'}
                        </SubmitButton>
                        {!userLoggedIn && (
                            <SignInLink theme={theme}>
                                Already have an account? {' '}
                                <StyledLink to={'/login'} theme={theme}>Continue</StyledLink>
                            </SignInLink>
                        )}
                    </RegisterForm>
                </RegisterCard>
            </RegisterContainer>
        </>
    );
};

export default Register;

// Styled Components
const RegisterContainer = styled.main`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#0F172A' : '#FFF8E7'};
  transition: background-color 0.3s ease;
  padding-top: 80px;
`;

const RegisterCard = styled.div`
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

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#1F2937'};
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  cursor: ${props => props.isRegistering ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background-color: ${props => props.isRegistering 
    ? (props.theme === 'dark' ? '#475569' : '#9CA3AF')
    : (props.theme === 'dark' ? '#6366F1' : '#3B82F6')};
  color: white;
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  box-shadow: ${props => !props.isRegistering 
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

const SignInLink = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#CBD5E1' : '#4B5563'};
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
