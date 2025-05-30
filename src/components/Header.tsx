'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--dark-gold);
  margin: 0;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
`;

const MenuButton = styled.button`
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

const Nav = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    right: ${props => props.$isOpen ? '0' : '-100%'};
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    flex-direction: column;
    justify-content: center;
    transition: right 0.3s ease;
    z-index: 1001;
  }
`;

const NavLink = styled.a`
  color: var(--dark-gold);
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;

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
    &::after {
      width: 100%;
    }
  }

  @media (max-width: 1024px) {
    font-size: 1.2rem;
    padding: 1rem;
    width: 100%;
    text-align: center;
  }
`;

const FooterContent = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  color: var(--dark-gold);
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    color: var(--light-gold);
    transform: scale(1.1);
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
  display: none;

  @media (max-width: 1024px) {
    display: block;
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
      <Logo>Photogragh</Logo>
      <MenuButton onClick={() => setIsMenuOpen(true)}>
        ☰
      </MenuButton>
      <AnimatePresence>
        {isMenuOpen && (
          <Nav $isOpen={isMenuOpen}>
            <CloseButton onClick={() => setIsMenuOpen(false)}>×</CloseButton>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#gallery">Gallery</NavLink>
            <NavLink href="#contact">Contact</NavLink>
            <FooterContent>
              <p>© 2024 Photogragh. All rights reserved.</p>
              <SocialLinks>
                <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </SocialLink>
                <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  Twitter
                </SocialLink>
              </SocialLinks>
            </FooterContent>
          </Nav>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
};

export default Header; 