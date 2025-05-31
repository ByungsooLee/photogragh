'use client';

import styled from 'styled-components';
import Header from '@/components/Header';
import { useState, useEffect, useRef } from 'react';

const AboutContainer = styled.div`
  min-height: 100vh;
  padding-top: 80px;
  background: #1a1a1a;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

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
  max-width: 900px;
  width: 100%;
  min-height: 400px;
  perspective: 1000px;
  z-index: 10;
  padding: 20px;
  touch-action: none;

  @media (max-width: 768px) {
    padding: 10px;
    min-height: 320px;
  }
`;

const Ticket = styled.div<{ $rotateX: number; $rotateY: number; $isFlipped: boolean }>`
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d4b0 100%);
  color: #2c1810;
  border-radius: 15px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 100%;
  min-height: 400px;
  overflow: hidden;
  padding-bottom: 32px;
  transform: rotateX(${props => props.$rotateX}deg) rotateY(${props => props.$rotateY}deg) ${props => props.$isFlipped ? 'rotateY(180deg)' : ''};
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;
  touch-action: none;

  &:hover {
  
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(0, 0, 0, 0.1);
  }

  &:active {
    cursor: grabbing;
    transition: transform 0.05s ease-out;
  }

  @media (max-width: 768px) {
    transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'none'};
    box-shadow: 
      0 10px 20px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.1);
    
    &:hover {
      transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'scale(1.01)'};
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 100px,
        rgba(0, 0, 0, 0.02) 100px,
        rgba(0, 0, 0, 0.02) 101px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 100px,
        rgba(0, 0, 0, 0.02) 100px,
        rgba(0, 0, 0, 0.02) 101px
      );
    pointer-events: none;
  }
`;

const Perforation = styled.div`
  position: absolute;
  right: 35%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 5px,
    #1a1a1a 5px,
    #1a1a1a 10px
  );
  z-index: 5;

  &::before {
    content: '✂ - - - - - - - - - - - - - - - - -';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 20px;
    font-size: 12px;
    color: rgba(44, 24, 16, 0.3);
    white-space: nowrap;
    letter-spacing: 2px;
  }

  @media (max-width: 768px) {
    right: 0;
    top: 50%;
    bottom: auto;
    width: 100%;
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 5px,
      #1a1a1a 5px,
      #1a1a1a 10px
    );

    &::before {
      content: '✂ - - - - - - - - - - - - - - - - -';
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }
  }
`;

const TicketContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  z-index: 1;
  display: flex;
`;

const TicketContentInner = styled.div`
  display: grid;
  grid-template-columns: 65% 35%;
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const MainSection = styled.div`
  padding: 40px;
  position: relative;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const CinemaName = styled.div`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  letter-spacing: 4px;
  opacity: 0.6;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const MovieTitle = styled.h1`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  line-height: 1;
  letter-spacing: 2px;
  margin-bottom: 10px;
  text-transform: uppercase;
  color: #8b0000;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
  text-decoration: none;

  @media (max-width: 768px) {
    font-size: 36px;
    text-align: center;
  }
`;

const Starring = styled.p`
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 30px;
`;

const MovieDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const DetailItem = styled.div`
  position: relative;
`;

const DetailLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.6;
  margin-bottom: 5px;
`;

const DetailValue = styled.div`
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 16px;
  font-weight: 500;
`;

const SkillsSection = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed rgba(44, 24, 16, 0.3);
`;

const SkillsLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.6;
  margin-bottom: 10px;
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SkillTag = styled.span`
  background: rgba(139, 0, 0, 0.1);
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  border: 1px solid rgba(139, 0, 0, 0.2);
`;

const StubSection = styled.div`
  background: linear-gradient(135deg, #e8d4b0 0%, #d4a574 100%);
  padding: 40px 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 2px dashed rgba(44, 24, 16, 0.3);

  @media (max-width: 768px) {
    border-left: none;
    border-top: 2px dashed rgba(44, 24, 16, 0.3);
    padding: 30px 20px;
    text-align: center;
  }
`;

const StubHeader = styled.div`
  text-align: center;
`;

const AdmitOne = styled.div`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 3px;
  margin-bottom: 10px;
  color: #8b0000;
`;

const TicketNumber = styled.div`
  font-size: 12px;
  opacity: 0.6;
  margin-bottom: 20px;
`;

const SeatInfo = styled.div`
  text-align: center;
  margin: 30px 0;

  @media (max-width: 768px) {
    margin: 20px 0;
  }
`;

const SeatRow = styled.div`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 36px;
  letter-spacing: 2px;
  color: #2c1810;
`;

const SeatNumber = styled.div`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 36px;
  letter-spacing: 2px;
  color: #2c1810;
`;

const SeatLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.6;
`;

const Barcode = styled.div`
  margin-top: auto;
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const BarcodeLines = styled.div`
  display: flex;
  justify-content: center;
  height: 50px;
  margin-bottom: 5px;
  gap: 2px;
`;

const BarcodeLine = styled.div`
  width: 2px;
  height: 100%;
  background: #2c1810;

  &:nth-child(odd) {
    width: 4px;
  }

  &:nth-child(3n) {
    height: 80%;
    align-self: flex-end;
  }
`;

const BarcodeNumber = styled.div`
  font-size: 10px;
  opacity: 0.6;
  letter-spacing: 2px;
`;

const ContactInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 40px;
  display: flex;
  gap: 20px;
  font-size: 12px;
  opacity: 0.6;

  @media (max-width: 768px) {
    position: static;
    justify-content: center;
    margin-top: 20px;
  }
`;

const ContactItem = styled.a`
  text-decoration: none;
  color: inherit;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const TicketBack = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/cinema_ticket_bg.png') center center/cover no-repeat, #ff00ff33;
  border-radius: 15px;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  z-index: 2;
  transform: rotateY(180deg);
  cursor: pointer;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export default function About() {
  const [rotateX, setRotateX] = useState(5);
  const [rotateY, setRotateY] = useState(-2);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    setRotateY(rotateY + deltaX * 0.1);
    setRotateX(rotateX - deltaY * 0.1);
    
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const touch = e.touches[0];
    
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    setRotateY(rotateY + deltaX * 0.1);
    setRotateX(rotateX - deltaY * 0.1);
    
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleClick = () => {
    if (isDragging) return; // ドラッグ中はフリップしない
    setIsFlipped(!isFlipped);
  };

  return (
    <AboutContainer>
      <Header />
      <TicketWrapper>
        <Ticket 
          ref={ticketRef}
          $rotateX={rotateX}
          $rotateY={rotateY}
          $isFlipped={isFlipped}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
        >
          <Perforation />
          <TicketContent>
            <TicketContentInner>
              <MainSection>
                <CinemaName>Life Cinema Complex</CinemaName>
                <MovieTitle>The DataEngineer</MovieTitle>
                <Starring>Starring: Byungsoo Lee</Starring>
                
                <MovieDetails>
                  <DetailItem>
                    <DetailLabel>Runtime</DetailLabel>
                    <DetailValue>∞ minutes</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Genre</DetailLabel>
                    <DetailValue>Programmer / Photographer</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Director</DetailLabel>
                    <DetailValue>Serenity & Inspiration</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Release Date</DetailLabel>
                    <DetailValue>Since 1995</DetailValue>
                  </DetailItem>
                </MovieDetails>
                
                <SkillsSection>
                  <SkillsLabel>Special Features</SkillsLabel>
                  <SkillsList>
                    <SkillTag>Sony a7R III</SkillTag>
                    <SkillTag>24-105mm G</SkillTag>
                  </SkillsList>
                </SkillsSection>
                
                <ContactInfo>
                  <ContactItem href="#">📧 Email: not yet</ContactItem>
                  <ContactItem href="#">💼 Portfolio</ContactItem>
                </ContactInfo>
              </MainSection>
              
              <StubSection>
                <StubHeader>
                  <AdmitOne>ADMIT ONE</AdmitOne>
                  <TicketNumber>No. 20250531</TicketNumber>
                </StubHeader>
                
                <SeatInfo>
                  <SeatLabel>Row</SeatLabel>
                  <SeatRow>VIP</SeatRow>
                  <SeatLabel style={{ marginTop: '20px' }}>Seat</SeatLabel>
                  <SeatNumber>A-1</SeatNumber>
                </SeatInfo>
                
                <Barcode>
                  <BarcodeLines>
                    {[...Array(15)].map((_, i) => (
                      <BarcodeLine key={i} />
                    ))}
                  </BarcodeLines>
                  <BarcodeNumber>8 901234 567890</BarcodeNumber>
                </Barcode>
              </StubSection>
            </TicketContentInner>
            <TicketBack>
              {/* ここに元のテキストやデザイン要素を復元。画像表示は削除。必要に応じて以前の内容を記載。*/}
              {/* 例: "Thank you for visiting!" などのメッセージや装飾のみ */}
            </TicketBack>
          </TicketContent>
        </Ticket>
      </TicketWrapper>
    </AboutContainer>
  );
} 