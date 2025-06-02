"use client";

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Modal from './Modal';
import FilmStrip from './FilmStrip';
import LoadingScreen from './LoadingScreen';
import Navigation from './Navigation';
import { type Photo, getDummyPhotos, getAllPhotos } from '../lib/microcms';

const FilmGallery = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100vh;
  overflow: hidden !important;
  background: radial-gradient(ellipse at center, var(--bg-medium) 0%, var(--bg-dark) 100%);
  padding-top: 80px;
  padding-bottom: 80px;
  touch-action: none;
  -webkit-overflow-scrolling: none;
  overscroll-behavior: none;
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
  overflow: hidden !important;
  touch-action: none;
  -webkit-overflow-scrolling: none;
  overscroll-behavior: none;
  @media (max-width: 600px) {
    gap: 4vw;
    padding: 0 2vw;
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

export default function HomeClient() {
  // 初期状態でlocalStorageキャッシュ or ダミー画像
  const getInitialPhotos = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('gallery_photos');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          // 空配列や不正値は即クリア
          localStorage.removeItem('gallery_photos');
        } catch {
          localStorage.removeItem('gallery_photos');
        }
      }
    }
    return getDummyPhotos();
  };
  const [photos, setPhotos] = useState<Photo[]>(getInitialPhotos().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalSourcePosition, setModalSourcePosition] = useState<{ x: number; y: number } | undefined>();
  const [modalKey, setModalKey] = useState('');

  // キャッシュがなければAPI取得、あれば即表示
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('gallery_photos');
      if (cached) {
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(true);
    getAllPhotos().then((photos) => {
      setPhotos(photos.slice(0, 10));
      if (typeof window !== 'undefined') {
        localStorage.setItem('gallery_photos', JSON.stringify(photos.slice(0, 10)));
      }
      setIsLoading(false);
    }).catch(() => {
      setPhotos(getDummyPhotos().slice(0, 10));
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false);
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const handlePhotoClick = (photo: { url: string; title: string; caption: string; position: { x: number; y: number } }) => {
    setModalImage(photo.url);
    setModalTitle(photo.title);
    setModalCaption(photo.caption);
    setModalSourcePosition(photo.position);
    setModalKey(photo.url + '_' + Date.now());
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