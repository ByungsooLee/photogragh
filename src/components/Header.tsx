'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;

  @media (max-width: 600px) {
    height: 48px;
    padding: 0.5rem 1rem;
  }
`;

const Logo = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--dark-gold);
  margin: 0;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  text-decoration: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
  background: none !important;
  &::after {
    display: none !important;
    content: none !important;
  }

  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const LogoLink = styled(Link)`
  text-decoration: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
  background: none !important;
  &::after {
    display: none !important;
    content: none !important;
  }
`;

const MenuButton = styled.button<{ $isOpen: boolean }>`
  background: none;
  border: none;
  color: var(--dark-gold);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: var(--light-gold);
  }

  @media (min-width: 1025px) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: auto;
  position: relative;
  z-index: 1002;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: var(--dark-gold);
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  white-space: nowrap;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--dark-gold);
    transition: width 0.3s ease;
  }

  &:hover {
    color: var(--light-gold);
    background: rgba(212, 175, 55, 0.1);
    &::after {
      width: 100%;
    }
  }
`;

const InstagramIcon = styled(FaInstagram)`
  font-size: 2rem;
  color: var(--dark-gold);
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 4px;
  display: inline-block;

  &:hover {
    color: var(--light-gold);
    transform: scale(1.1);
    background: rgba(212, 175, 55, 0.1);
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 1024px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    z-index: 1001;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--dark-gold);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;

  @media (min-width: 1025px) {
    display: none;
  }
`;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <HeaderContainer>
      <LogoLink href="/" passHref>
        <Logo>L.MARK</Logo>
      </LogoLink>
      <Nav
        role="navigation"
        aria-label="メインナビゲーション"
        aria-hidden={isMenuOpen}
        tabIndex={isMenuOpen ? -1 : 0}
      >
        <NavLink href="/gallery">Gallery</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
        <NavLink href="/instagram">
          Instagram
        </NavLink>
      </Nav>
      <MenuButton 
        onClick={() => setIsMenuOpen(true)}
        aria-label="メニューを開く"
        aria-expanded={isMenuOpen}
        $isOpen={isMenuOpen}
      >
        ☰
      </MenuButton>
      <MobileMenu 
        $isOpen={isMenuOpen}
        aria-hidden={!isMenuOpen}
        tabIndex={!isMenuOpen ? -1 : 0}
        role="navigation"
        aria-label="モバイルメニュー"
      >
        <CloseButton 
          onClick={() => setIsMenuOpen(false)}
          aria-label="メニューを閉じる"
        >
          ×
        </CloseButton>
        <NavLink href="/instagram" onClick={() => setIsMenuOpen(false)}>
          <InstagramIcon />
        </NavLink>
        <NavLink href="/gallery" onClick={() => setIsMenuOpen(false)}>Gallery</NavLink>
        <NavLink href="/about" onClick={() => setIsMenuOpen(false)}>About</NavLink>
        <NavLink href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header; 