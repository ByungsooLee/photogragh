import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background: var(--bg-dark);
  color: var(--gold);
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ReloadButton = styled.button`
  background: var(--dark-gold);
  color: var(--bg-dark);
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--light-gold);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };
  
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>申し訳ございません</ErrorTitle>
          <ErrorMessage>
            エラーが発生しました。ページを再読み込みしてください。
          </ErrorMessage>
          <ReloadButton onClick={() => window.location.reload()}>
            再読み込み
          </ReloadButton>
        </ErrorContainer>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary; 