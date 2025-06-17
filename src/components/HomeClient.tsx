"use client";

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Modal from './Modal';
import FilmStrip from './FilmStrip';
import LoadingScreen from './LoadingScreen';
import Navigation from './Navigation';
import { getGallery, type GalleryItem } from '../lib/microcms';

const FilmGallery = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100vh;
  overflow: hidden !important;
  background: radial-gradient(ellipse at center, var(--bg-medium) 0%, var(--bg-dark) 100%);
  padding-top: 80px;
  touch-action: none;
  -webkit-overflow-scrolling: none;
  overscroll-behavior: none;
  @media (max-width: 600px) {
    padding-top: 24px;
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
  overflow: hidden !important;
  touch-action: none;
  -webkit-overflow-scrolling: none;
  overscroll-behavior: none;
  @media (min-width: 601px) {
    gap: 6vw;
  }
  @media (max-width: 600px) {
    gap: 2vw;
    padding: 0 1vw 16vw 1vw;
  }
`;

const ScrollPreventOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  background: transparent;
  touch-action: none;
  -webkit-overflow-scrolling: none;
  overscroll-behavior: none;
  pointer-events: none;
`;

function getOriginalImageUrl(imageUrls: string | string[] | undefined): string | undefined {
  if (!imageUrls) return undefined;
  if (Array.isArray(imageUrls)) return getOriginalImageUrl(imageUrls[0]);
  try {
    const obj = JSON.parse(imageUrls);
    if (typeof obj === 'object' && obj['オリジナル画像']) {
      return obj['オリジナル画像'];
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export default function HomeClient() {
  const [mounted, setMounted] = useState(false);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalSourcePosition, setModalSourcePosition] = useState<{ x: number; y: number } | undefined>();
  const [modalKey, setModalKey] = useState('');

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const { items } = await getGallery({ filters: 'featured[equals]true', limit: 10 });
        setPhotos(items);
        if (typeof window !== 'undefined') {
          localStorage.setItem('gallery_photos', JSON.stringify(items));
        }
      } catch {
        setPhotos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false);
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  // マウント状態を管理
  useEffect(() => {
    setMounted(true);
  }, []);

  // マウント前はローディング画面のみ表示
  if (!mounted) {
    return <LoadingScreen />;
  }

  const handlePhotoClick = (photo: GalleryItem & { position?: { x: number; y: number } }) => {
    const url = getOriginalImageUrl(photo.imageUrls);
    setModalImage(url || '');
    setModalTitle(photo.title);
    setModalCaption(photo.description);
    setModalSourcePosition(photo.position);
    setModalKey((url || '') + '_' + Date.now());
    setIsModalOpen(true);
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <Navigation />
      <ScrollPreventOverlay />
      <FilmGallery>
        <Header />
        <FilmContainer>
          {isLoading ? (
            <div style={{ color: '#d4af37', textAlign: 'center', margin: '2rem auto' }}>Loading...</div>
          ) : (
            <>
              {/* 横3列 */}
              <FilmStrip stripId="h1" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
              <FilmStrip stripId="h2" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
              <FilmStrip stripId="h3" isVertical={false} onPhotoClick={handlePhotoClick} photos={photos} />
              
              {/* 縦3列 */}
              <FilmStrip stripId="v1" isVertical position="left" onPhotoClick={handlePhotoClick} photos={photos} className="hidden md:block" />
              <FilmStrip stripId="v2" isVertical position="center" onPhotoClick={handlePhotoClick} photos={photos} />
              <FilmStrip stripId="v3" isVertical position="right" onPhotoClick={handlePhotoClick} photos={photos} className="hidden md:block" />
            </>
          )}
        </FilmContainer>
      </FilmGallery>
      <Modal
        key={modalKey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={modalImage}
        title={modalTitle}
        caption={modalCaption}
        sourcePosition={modalSourcePosition}
      />
    </>
  );
} 