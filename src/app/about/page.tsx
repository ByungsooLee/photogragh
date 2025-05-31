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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  @media (max-width: 768px) {
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-top: 0;
  }
`;

const Ticket = styled.div<{ $isReverse: boolean; $isClicked: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isReverse ? 'row-reverse' : 'row'};
  width: 420px;
  height: 170px;
  background: transparent;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  position: relative;
  overflow: visible;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.$isClicked ? 'translateZ(100px) scale(0.8) rotate(15deg)' : 'none'};
  opacity: ${props => props.$isClicked ? '0' : '1'};
  perspective: 1000px;
  @media (max-width: 1024px) {
    width: 92vw;
    height: 38vw;
    min-height: 140px;
    max-width: 420px;
    max-height: 200px;
  }
  @media (max-width: 600px) {
    flex-direction: row !important;
    width: 94vw;
    height: 44vw;
    min-height: 140px;
    max-width: 340px;
    max-height: 180px;
    transform: ${props => props.$isClicked ? 'translate(-50%, -50%) rotate(105deg) translateZ(100px) scale(0.8)' : 'translate(-50%, -50%) rotate(90deg)'};
    position: absolute;
    left: 50%;
    top: 50%;
  }
`;

const FilmPart = styled.div`
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
const MainPart = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%);
  border-radius: 0 16px 16px 0;
  color: #fff;
  padding: 22px 24px 18px 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
  overflow: hidden;
  @media (max-width: 600px) {
    border-radius: 0 12px 12px 0;
    padding: 14px 10px 10px 10px;
    writing-mode: initial;
    text-orientation: initial;
    align-items: flex-start;
    > * {
      transform: none;
      margin: initial;
      text-align: initial;
      width: initial;
      max-width: initial;
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
  margin-top: auto;
  font-weight: bold;
  letter-spacing: 1px;
`;

const FilmReel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  animation: filmReel 2s ease-in-out;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.1) 2px,
    rgba(255, 255, 255, 0.1) 4px
  );

  @keyframes filmReel {
    0% { opacity: 0; transform: translateY(100%); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-100%); }
  }
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 600);
      setIsTablet(window.innerWidth > 600 && window.innerWidth <= 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // レスポンシブで左右反転
  const isReverse = isMobile || isTablet;

  const handleTicketClick = () => {
    if (isClicked || showPoster) return;
    setIsClicked(true);
    setTimeout(() => {
      setShowPoster(true);
    }, 800);
  };

  return (
    <AboutContainer>
      <Header />
      <TicketWrapper>
        {!showPoster && (
          <div style={{position:'relative', width:'100%', height:'100%'}}>
            <Ticket 
              $isReverse={isReverse} 
              $isClicked={isClicked}
              onClick={handleTicketClick} 
              style={{
                cursor: isClicked ? 'default' : 'pointer',
                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* 黒いフィルム部分 */}
              <FilmPart>
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
              <MainPart>
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
            {isClicked && <FilmReel />}
          </div>
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