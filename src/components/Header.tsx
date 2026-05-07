'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

type HeaderProps = {
  variant?: 'light' | 'dark';
  workHref?: string;
};

const HeaderContainer = styled.header<{ $variant: 'light' | 'dark' }>`
  position: sticky;
  top: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 24px;
  width: 100%;
  min-height: 76px;
  padding: 16px clamp(18px, 4vw, 56px);
  background: transparent;
  color: ${props => props.$variant === 'dark' ? '#f6ebcf' : 'var(--ink)'};
  pointer-events: none;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: start;
    padding: 14px 18px;
  }
`;

const Brand = styled(Link)`
  justify-self: start;
  display: grid;
  gap: 3px;
  color: inherit;
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(2.1rem, 4.2vw, 4.6rem);
  font-weight: 400;
  letter-spacing: 0.045em;
  text-transform: uppercase;
  line-height: 0.78;
  text-shadow: 0 2px 0 rgba(201, 154, 52, 0.32);
  pointer-events: auto;

  span {
    display: block;
  }

  small {
    font-family: var(--font-inter), sans-serif;
    font-size: clamp(0.48rem, 0.72vw, 0.66rem);
    font-weight: 700;
    letter-spacing: 0.28em;
    line-height: 1;
    color: var(--gold);
    text-shadow: none;
  }

  @media (max-width: 720px) {
    font-size: clamp(2rem, 12vw, 3.4rem);
    letter-spacing: 0.035em;
  }
`;

const Nav = styled.nav`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.7vw, 24px);
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(1.05rem, 1.45vw, 1.45rem);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  pointer-events: auto;

  @media (max-width: 720px) {
    justify-self: start;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: inherit;
  opacity: ${props => props.$active ? 1 : 0.78};
  border: 1px solid ${props => props.$active ? 'currentColor' : 'transparent'};
  border-left-color: currentColor;
  border-right-color: currentColor;
  padding: 5px 10px 3px;
  white-space: nowrap;
  transition: color 180ms ease, border-color 180ms ease, opacity 180ms ease;

  &:hover {
    opacity: 1;
    border-color: currentColor;
  }
`;

const Comma = styled.span`
  color: var(--gold);
  opacity: 0.9;
`;

const Header = ({ variant = 'light', workHref = '/gallery' }: HeaderProps) => {
  const pathname = usePathname();
  const workActive = pathname === '/' || pathname === '/gallery';

  return (
    <HeaderContainer $variant={variant}>
      <Brand href="/" aria-label="L.MARK home">
        <span>L.MARK</span>
        <small>Photo Picture Archive</small>
      </Brand>
      <Nav aria-label="Main navigation">
        <NavLink href={workHref} $active={workActive}>Work</NavLink>
        <Comma>,</Comma>
        <NavLink href="/about" $active={pathname === '/about'}>About</NavLink>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
