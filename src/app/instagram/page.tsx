'use client';
import styled, { keyframes } from 'styled-components';
import React from 'react';
import Header from '@/components/Header';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: none; }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(120deg, #18120a 60%, #2d230c 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffe9a7;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  position: relative;
  overflow: hidden;
`;

const FilmBorder = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 12px solid #d4af37;
  border-radius: 32px;
  pointer-events: none;
  box-shadow: 0 0 32px #d4af37cc, 0 0 0 8px #18120a;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  letter-spacing: 0.2em;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 24px #000, 0 0 2px #d4af37;
  animation: ${fadeIn} 1.2s cubic-bezier(0.4,0,0.2,1);
`;

const Sub = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 8px #000, 0 0 2px #d4af37;
  animation: ${fadeIn} 1.8s cubic-bezier(0.4,0,0.2,1);
`;

const FilmReel = styled.div`
  width: 120px;
  height: 120px;
  border: 8px solid #ffe9a7;
  border-radius: 50%;
  margin-bottom: 2rem;
  box-shadow: 0 0 24px #d4af37cc;
  position: relative;
  animation: spin 6s linear infinite;
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
  &::before, &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 16px;
    height: 16px;
    background: #d4af37;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  &::after {
    width: 8px;
    height: 8px;
    background: #18120a;
    z-index: 2;
  }
`;

const EndRoll = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  color: #ffe9a7;
  font-size: 1.1rem;
  text-align: center;
  padding-bottom: 2.5rem;
  opacity: 0.7;
  font-family: 'Noto Serif JP', serif;
  letter-spacing: 0.08em;
  animation: ${fadeIn} 2.5s cubic-bezier(0.4,0,0.2,1);
`;

export default function InstagramComingSoon() {
  return (
    <Container>
      <Header />
      <FilmBorder />
      <FilmReel />
      <Title>Coming Soon</Title>
      <Sub>Our Instagram page is coming soon.<br />Stay tuned for the premiere!</Sub>
      <EndRoll>Inspired by Cinema Paradiso / Designed by Byungsoo Lee</EndRoll>
    </Container>
  );
} 