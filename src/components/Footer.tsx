'use client';

import styled from 'styled-components';

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.95), transparent);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const Copyright = styled.p`
  color: var(--gold);
  font-size: 14px;
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const SocialLink = styled.a`
  color: var(--gold);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--light-gold);
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <Copyright>© 2024 Photogragh. All rights reserved.</Copyright>
      <SocialLinks>
        <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          Instagram
        </SocialLink>
        <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          Twitter
        </SocialLink>
      </SocialLinks>
    </FooterContainer>
  );
};

export default Footer; 