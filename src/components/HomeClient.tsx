"use client";

import { useState, useEffect, useRef } from 'react';
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

function getImageUrls(imageUrls: string | string[] | undefined) {
  if (!imageUrls) return {};
  if (Array.isArray(imageUrls)) return getImageUrls(imageUrls[0]);
  try {
    const obj = JSON.parse(imageUrls);
    return obj;
  } catch {
    return {};
  }
}

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
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
  const isNavigating = useRef(false);

  const stripIds = [
    { id: 'h1', isVertical: false, position: undefined, className: undefined },
    { id: 'h2', isVertical: false, position: undefined, className: undefined },
    { id: 'h3', isVertical: false, position: undefined, className: undefined },
    { id: 'v1', isVertical: true, position: 'left' as const, className: 'hidden md:block' },
    { id: 'v2', isVertical: true, position: 'center' as const, className: undefined },
    { id: 'v3', isVertical: true, position: 'right' as const, className: 'hidden md:block' },
  ];

  // 各列ごとにロゴを入れるかランダムで決定
  const logoFlags = stripIds.map(() => Math.random() < 0.5);
  // どの列にもロゴが入らなければ、どれか1列に必ずロゴを入れる
  if (!logoFlags.includes(true)) {
    const randomIndex = Math.floor(Math.random() * logoFlags.length);
    logoFlags[randomIndex] = true;
  }

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

  // ナビゲーション中はモーダルを開かないようにする
  useEffect(() => {
    const handleBeforeUnload = () => {
      isNavigating.current = true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // マウント前はローディング画面のみ表示
  if (!mounted) {
    return <LoadingScreen />;
  }

  const handlePhotoClick = (photo: GalleryItem & { position?: { x: number; y: number } }) => {
    console.log('HomeClient: handlePhotoClick called', { 
      photo, 
      isNavigating: isNavigating.current,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });
    
    if (!photo || !photo.imageUrls || isNavigating.current) {
      console.log('HomeClient: Early return', { 
        hasPhoto: !!photo, 
        hasImageUrls: !!photo?.imageUrls, 
        isNavigating: isNavigating.current 
      });
      return;
    }
    
    // FilmStripと同じ方法で画像URLを取得
    const urls = getImageUrls(photo.imageUrls);
    const url = urls['オリジナル画像'] || urls['大サイズ'] || urls['中サイズ'] || '';
    
    console.log('HomeClient: Image URLs', { urls, selectedUrl: url });
    
    if (!isValidUrl(url)) {
      console.log('HomeClient: Invalid URL', { url });
      return;
    }
    
    // setTimeoutを削除して即座にモーダルを開く
    console.log('HomeClient: Opening modal', { url, title: photo.title });
    setModalImage(url);
    setModalTitle(photo.title || '');
    setModalCaption(photo.description || '');
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
              {stripIds.map((strip, idx) => (
                <FilmStrip
                  key={strip.id}
                  stripId={strip.id}
                  isVertical={strip.isVertical}
                  position={strip.position}
                  onPhotoClick={handlePhotoClick}
                  photos={photos}
                  className={strip.className}
                  showLogo={logoFlags[idx]}
                />
              ))}
            </>
          )}
        </FilmContainer>
      </FilmGallery>
      <Modal
        key={modalKey}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalImage('');
          setModalTitle('');
          setModalCaption('');
          setModalSourcePosition(undefined);
        }}
        imageUrl={modalImage}
        title={modalTitle}
        caption={modalCaption}
        sourcePosition={modalSourcePosition}
      />
    </>
  );
} 