'use client';

import styled from 'styled-components';

interface HeaderProps {
  speed: number;
  showSpeedIndicator: boolean;
}

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(10, 10, 10, 0.95), transparent);
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(5px);
`;

const Title = styled.h1`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavLink = styled.a`
  color: var(--gold);
  text-decoration: none;
  font-family: 'Noto Serif JP', serif;
  font-size: 16px;
  padding: 8px 16px;
  border: 1px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--gold);
    background: rgba(212, 175, 55, 0.1);
  }
`;

const SpeedIndicator = styled.div<{ $show: boolean }>`
  color: var(--gold);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px;
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '20px'});
  transition: all 0.3s ease;
  border: 1px solid var(--gold);
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
`;

export default function Header({ speed, showSpeedIndicator }: HeaderProps) {
  return (
    <HeaderContainer>
      <Title>Film Gallery</Title>
      <Nav>
        <NavLink href="#">Gallery</NavLink>
        <NavLink href="#">About</NavLink>
        <NavLink href="#">Contact</NavLink>
      </Nav>
      <SpeedIndicator $show={showSpeedIndicator}>
        速度: <span className="speed-value">{speed.toFixed(1)}</span>x
      </SpeedIndicator>
    </HeaderContainer>
  );
} 