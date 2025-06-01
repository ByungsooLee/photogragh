"use client";

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Modal from './Modal';
import FilmStrip from './FilmStrip';
import { getPhotos, type Photo } from '../lib/microcms';
import { getDummyPhotos } from '../lib/microcms';

const FilmGallery = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100vh;
  overflow-x: hidden;
  background: radial-gradient(ellipse at center, var(--bg-medium) 0%, var(--bg-dark) 100%);
  padding-top: 80px;
  padding-bottom: 80px;
  @media (max-width: 600px) {
    padding-top: 24px;
    padding-bottom: 24px;
    min-height: 100dvh;
  }
`;

const FilmContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  gap: 2vw;
  @media (max-width: 600px) {
    gap: 4vw;
    padding: 0 2vw;
  }
`;

export default function HomeClient() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalSourcePosition, setModalSourcePosition] = useState<{ x: number; y: number } | undefined>();

  useEffect(() => {
    setIsLoading(true);
    getPhotos().then(({ photos }) => {
      setPhotos(photos && photos.length > 0 ? photos : getDummyPhotos());
      setIsLoading(false);
    }).catch(() => {
      setPhotos(getDummyPhotos());
      setIsLoading(false);
    });
  }, []);

  const handlePhotoClick = (photo: { url: string; title: string; caption: string; position: { x: number; y: number } }) => {
    setModalImage(photo.url);
    setModalTitle(photo.title);
    setModalCaption(photo.caption);
    setModalSourcePosition(photo.position);
    setIsModalOpen(true);
  };

  return (
    <FilmGallery>
      <Header />
      <FilmContainer>
        {isLoading ? (
          <div style={{ color: '#d4af37', textAlign: 'center', margin: '2rem auto' }}>Loading...</div>
        ) : (
          <>
            <FilmStrip stripId="strip1" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
            <FilmStrip stripId="strip2" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
            <FilmStrip stripId="strip3" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
            <FilmStrip stripId="strip4" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
            <FilmStrip stripId="strip5" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
            <FilmStrip stripId="vstripL" isVertical position="left" onPhotoClick={handlePhotoClick} photos={photos} className="hidden md:block" />
            <FilmStrip stripId="vstripC" isVertical position="center" onPhotoClick={handlePhotoClick} photos={photos} />
            <FilmStrip stripId="vstripR" isVertical position="right" onPhotoClick={handlePhotoClick} photos={photos} className="hidden md:block" />
          </>
        )}
      </FilmContainer>
      <Modal
        key={modalImage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={modalImage}
        title={modalTitle}
        caption={modalCaption}
        sourcePosition={modalSourcePosition}
      />
    </FilmGallery>
  );
} 