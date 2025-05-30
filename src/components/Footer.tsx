'use client';

import styled from 'styled-components';

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.95), transparent);
  z-index: 1000;
  text-align: center;
  backdrop-filter: blur(5px);
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterText = styled.div`
  color: var(--gold);
  font-family: 'Noto Serif JP', serif;
  font-size: 14px;
  opacity: 0.8;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const SocialLink = styled.a`
  color: var(--gold);
  text-decoration: none;
  font-size: 18px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--dark-gold);
    transform: scale(1.1);
  }
`;

export default function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText>
          © 2024 Film Gallery. All rights reserved.
        </FooterText>
        <SocialLinks>
          <SocialLink href="#">Instagram</SocialLink>
          <SocialLink href="#">Twitter</SocialLink>
          <SocialLink href="#">Facebook</SocialLink>
        </SocialLinks>
      </FooterContent>
    </FooterContainer>
  );
} 