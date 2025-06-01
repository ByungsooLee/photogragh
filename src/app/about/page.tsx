'use client';

import styled from 'styled-components';
import Header from '@/components/Header';
import { useState, useEffect } from 'react';

const AboutContainer = styled.div`
  min-height: 100vh;
  padding-top: 80px;
  background: #1a1a1a;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  @media (max-width: 768px) {
    padding: 0;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
  }

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(ellipse at top, rgba(139, 0, 0, 0.1) 0%, transparent 50%),
      linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
    z-index: -2;
  }

  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.01) 2px,
      rgba(255, 255, 255, 0.01) 4px
    );
    pointer-events: none;
    z-index: 100;
  }
`;

const TicketWrapper = styled.div`
  width: 100vw;
  min-height: calc(100vh - 80px);
  padding-top: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  @media (max-width: 600px) {
    padding: 24px 10px;
    min-height: unset;
    height: auto;
    justify-content: center;
    align-items: center;
  }
`;

const Ticket = styled.div<{ $isClicked: boolean }>`
  display: flex;
  flex-direction: row;
  width: 500px;
  height: 210px;
  background: transparent;
  border-radius: 28px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  overflow: visible;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.$isClicked ? '0' : '1'};
  perspective: 1000px;
  position: relative;
  @media (max-width: 600px) {
    width: calc(100vw - 20px);
    height: 180px;
    transform: rotate(90deg);
    margin: 8vw 0;
    border-radius: 18px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CutLineWrapper = styled.div`
  position: absolute;
  left: 0;
  margin-left: 90px;
  top: 0;
  bottom: 0;
  width: 48px;
  min-height: 120px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
`;

const CutLine = styled.div`
  width: 2px;
  height: 100%;
  border-left: 2px dashed #fff;
  position: absolute;
  left: 16px;
  top: 0;
  bottom: 0;
  z-index: 41;
`;

const ScissorsIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 42;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const CutHint = styled.div`
  position: absolute;
  left: 50%;
  top: -22px;
  transform: translateX(-50%);
  color: #222;
  font-size: 1.05rem;
  font-weight: 600;
  background: none;
  padding: 0;
  border-radius: 0;
  z-index: 50;
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const FilmPart = styled.div<{ $isCutting?: boolean }>`
  background: #222;
  width: 90px;
  height: 100%;
  border-radius: 16px 0 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 2px 0 8px rgba(0,0,0,0.18);
  z-index: 2;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  ${({ $isCutting }) => $isCutting && `
    transform: translateX(-120px) rotate(-8deg);
    opacity: 0.7;
  `}
  @media (max-width: 600px) {
    width: 90px;
    border-radius: 16px 0 0 16px;
  }
`;
const FilmHoles = styled.div`
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
  z-index: 3;
  @media (max-width: 600px) {
    width: 18px;
    height: 90%;
    left: 0;
    top: 0;
    bottom: 0;
  }
`;
const FilmHole = styled.div`
  width: 14px;
  height: 12px;
  background: #fff;
  border-radius: 4px;
  margin: 2px 0;
  @media (max-width: 600px) {
    width: 14px;
    height: 12px;
    margin: 2px 0;
  }
`;
const BarcodeArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
const BarcodeImg2 = styled.div`
  width: 48px;
  height: 80px;
  background: repeating-linear-gradient(
    to right,
    #222 0 2px, #fff 2px 6px
  );
  border-radius: 4px;
`;
const MainPart = styled.div<{ $isCutting?: boolean }>`
  flex: 1;
  background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%);
  border-radius: 0 20px 20px 0;
  color: #fff;
  padding: 32px 32px 36px 32px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  min-height: 200px;
  overflow: visible;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  ${({ $isCutting }) => $isCutting && `
    transform: translateX(120px) rotate(8deg);
    opacity: 0.7;
  `}
  @media (max-width: 600px) {
    border-radius: 0 14px 14px 0;
    padding: 18px 12px 22px 12px;
    writing-mode: initial;
    text-orientation: initial;
    align-items: flex-start;
    min-height: 140px;
    > * {
      transform: none;
      margin: initial;
      text-align: initial;
      width: initial;
      max-width: initial;
      white-space: normal;
      overflow: visible;
    }
  }
`;
const MainTitle = styled.div`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.1rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: lowercase;
  span { font-size: 1.1rem; font-weight: normal; margin-left: 4px; }
`;
const MainSub = styled.div`
  font-size: 1rem;
  opacity: 0.7;
  margin-bottom: 8px;
`;
const MainTime = styled.div`
  font-size: 1.2rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;
const PlayIcon = styled.span`
  font-size: 1.1rem;
  margin-right: 6px;
`;
const MainStars = styled.div`
  color: #fffde7;
  font-size: 1.1rem;
  margin-bottom: 8px;
`;
const MainInfo = styled.div`
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 1px;
`;

const PosterImg = styled.img`
  width: 90vw;
  max-width: 420px;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  margin: 0 auto;
  display: block;
  animation: posterDrop 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 2;

  @keyframes posterDrop {
    0% { 
      opacity: 0;
      transform: translateY(-100vh) rotate(-10deg);
      filter: brightness(0.5) contrast(1.2);
    }
    60% {
      opacity: 1;
      transform: translateY(20px) rotate(5deg);
      filter: brightness(1.2) contrast(1.1);
    }
    80% {
      transform: translateY(-10px) rotate(-2deg);
    }
    100% { 
      opacity: 1;
      transform: translateY(0) rotate(0);
      filter: brightness(1) contrast(1);
    }
  }
`;

export default function About() {
  const [isClicked, setIsClicked] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [isCutting, setIsCutting] = useState(false);

  // グローバル副作用リセット
  useEffect(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.display = '';
    document.documentElement.style.display = '';
    document.body.style.opacity = '';
    document.documentElement.style.opacity = '';
    document.body.style.visibility = '';
    document.documentElement.style.visibility = '';
    if (window.localStorage) localStorage.clear();
    if (window.sessionStorage) sessionStorage.clear();
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.display = '';
      document.documentElement.style.display = '';
      document.body.style.opacity = '';
      document.documentElement.style.opacity = '';
      document.body.style.visibility = '';
      document.documentElement.style.visibility = '';
      if (window.localStorage) localStorage.clear();
      if (window.sessionStorage) sessionStorage.clear();
    };
  }, []);

  const handleCut = () => {
    if (isClicked || showPoster || isCutting) return;
    setIsCutting(true);
    setTimeout(() => {
      setIsClicked(true);
      setTimeout(() => {
        setShowPoster(true);
      }, 400);
    }, 350); // アニメーション後に切り替え
  };

  return (
    <AboutContainer>
      <Header />
      <TicketWrapper>
        {!showPoster && (
          <Ticket 
            $isClicked={isClicked}
            onClick={handleCut}
            style={{
              cursor: isClicked ? 'default' : 'pointer',
              transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {!isCutting && (
              <CutLineWrapper>
                <CutHint>Tap to cut</CutHint>
                <CutLine />
                <ScissorsIcon>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="2.2" stroke="#222" strokeWidth="1.5" fill="#fff"/>
                    <circle cx="16" cy="16" r="2.2" stroke="#222" strokeWidth="1.5" fill="#fff"/>
                    <path d="M7.5 7.5L14.5 14.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M14.5 7.5L7.5 14.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M2 11H20" stroke="#222" strokeWidth="1.2" strokeDasharray="2 2"/>
                  </svg>
                </ScissorsIcon>
              </CutLineWrapper>
            )}
            {/* 黒いフィルム部分 */}
            <FilmPart $isCutting={isCutting}>
              <FilmHoles>
                {[...Array(7)].map((_, i) => (
                  <FilmHole key={i} />
                ))}
              </FilmHoles>
              <BarcodeArea>
                <BarcodeImg2 />
              </BarcodeArea>
            </FilmPart>
            {/* 赤いメイン部分 */}
            <MainPart $isCutting={isCutting}>
              <MainTitle>cinema <span>ticket</span></MainTitle>
              <MainSub>Lorem ipsum</MainSub>
              <MainTime>
                <PlayIcon>▶</PlayIcon> 21.00
              </MainTime>
              <MainStars>★ ★ ★ ★ ★</MainStars>
              <MainInfo>THEATER 1 / SEAT 16</MainInfo>
              <MainStars style={{opacity:0.2, fontSize:'2.5rem', position:'absolute', right:10, bottom:10}}>★</MainStars>
            </MainPart>
          </Ticket>
        )}
        {showPoster && (
          <PosterImg 
            src="/images/cinema-paradiso-poster.jpg" 
            alt="Cinema Paradiso"
          />
        )}
      </TicketWrapper>
    </AboutContainer>
  );
} 