'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';

const Nav = styled.nav<{ $isScrolled: boolean; $isHidden: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  transition: transform 0.3s ease, background-color 0.3s ease;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  transform: ${props => props.$isHidden ? 'translateY(-100%)' : 'translateY(0)'};
  box-shadow: ${props => props.$isScrolled ? '0 2px 20px rgba(0, 0, 0, 0.3)' : 'none'};

  @media (max-width: 600px) {
    height: 60px;
  }
`;

const NavContainer = styled.div`
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 600px) {
    padding: 0 1rem;
  }
`;

const Logo = styled(Link)`
  text-decoration: none;
  color: var(--gold);
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  font-size: 2rem;
  letter-spacing: 0.2em;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 600px) {
    gap: 1rem;
  }
`;

const NavItem = styled.li`
  position: relative;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  text-decoration: none;
  color: ${props => props.$isActive ? 'var(--gold)' : '#fff'};
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
  padding: 0.5rem 0;

  &:hover {
    color: var(--gold);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--gold);
    transform: scaleX(${props => props.$isActive ? 1 : 0});
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <Nav $isScrolled={isScrolled} $isHidden={isHidden}>
      <NavContainer>
        <Logo href="/" aria-label="L.MARK Home">
          L.MARK
        </Logo>
        
        <NavMenu role="navigation">
          <NavItem>
            <NavLink 
              href="/gallery" 
              $isActive={pathname === '/gallery'}
              aria-current={pathname === '/gallery' ? 'page' : undefined}
            >
              Gallery
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              href="/about" 
              $isActive={pathname === '/about'}
              aria-current={pathname === '/about' ? 'page' : undefined}
            >
              About
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              href="/contact" 
              $isActive={pathname === '/contact'}
              aria-current={pathname === '/contact' ? 'page' : undefined}
            >
              Contact
            </NavLink>
          </NavItem>
        </NavMenu>
      </NavContainer>
    </Nav>
  );
};

export default Navigation; 