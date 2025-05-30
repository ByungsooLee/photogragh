'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import FilmStrip from '../components/FilmStrip';
import Spotlight from '../components/Spotlight';

const SpeedIndicator = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: var(--gold);
  padding: 10px 20px;
  border-radius: 5px;
  font-family: 'Playfair Display', serif;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;
  z-index: 1000;
  border: 1px solid var(--dark-gold);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
`;

const FilmGallery = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, var(--bg-medium) 0%, var(--bg-dark) 100%);
  padding-top: 80px;
  padding-bottom: 80px;
`;

const FilmContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

export default function Home() {
  const [currentSpeed, setCurrentSpeed] = useState(20);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalSourcePosition, setModalSourcePosition] = useState<{ x: number; y: number } | undefined>();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newSpeed = Math.max(5, Math.min(40, currentSpeed + (e.deltaY > 0 ? 1 : -1)));
      setCurrentSpeed(newSpeed);
      setShowSpeedIndicator(true);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setShowSpeedIndicator(false);
      }, 3000);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentSpeed]);

  const handlePhotoClick = (photo: { url: string; title: string; caption: string; position: { x: number; y: number } }) => {
    setModalImage(photo.url);
    setModalTitle(photo.title);
    setModalCaption(photo.caption);
    setModalSourcePosition(photo.position);
    setIsModalOpen(true);
  };

  return (
    <FilmGallery>
      <Header speed={currentSpeed} showSpeedIndicator={showSpeedIndicator} />
      <Spotlight />
      <FilmContainer>
        <FilmStrip
          baseDuration={80}
          stripId="strip1"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
        />
        <FilmStrip
          baseDuration={85}
          stripId="strip2"
          isVertical={false}
          isReversed={true}
          onPhotoClick={handlePhotoClick}
        />
        <FilmStrip
          baseDuration={78}
          stripId="strip3"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
        />
        <FilmStrip
          baseDuration={82}
          stripId="strip4"
          isVertical={false}
          isReversed={true}
          onPhotoClick={handlePhotoClick}
        />
        <FilmStrip
          baseDuration={88}
          stripId="strip5"
          isVertical={false}
          onPhotoClick={handlePhotoClick}
        />
        <FilmStrip
          baseDuration={120}
          stripId="vstripL"
          isVertical={true}
          position="left"
          onPhotoClick={handlePhotoClick}
        />
        <FilmStrip
          baseDuration={120}
          stripId="vstrip1"
          isVertical={true}
          onPhotoClick={handlePhotoClick}
        />
        <FilmStrip
          baseDuration={120}
          stripId="vstripR"
          isVertical={true}
          position="right"
          onPhotoClick={handlePhotoClick}
        />
      </FilmContainer>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={modalImage}
        title={modalTitle}
        caption={modalCaption}
        sourcePosition={modalSourcePosition}
      />
      <Footer />
      <SpeedIndicator $show={showSpeedIndicator}>
        Speed: {currentSpeed}x
      </SpeedIndicator>
    </FilmGallery>
  );
}
