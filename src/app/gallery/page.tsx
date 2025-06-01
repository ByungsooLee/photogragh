'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getPhotos, type Photo as MicroCMSPhoto } from '@/lib/microcms';
import React from 'react';
import { CustomSelect } from '@/components/CustomSelect';
import Header from '@/components/Header';

// カテゴリーの型定義
type Category = 'all' | 'camp' | 'outdoor' | 'still-life' | 'cooking' | 'portrait' | 'landscape' | 'overseas' | 'bath' | 'person';

// 写真データの型定義
interface Photo extends MicroCMSPhoto {
  category: Category;
  date: string;
}

// スタイル定義
const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-dark);
  padding-top: 80px; // ヘッダーの高さ分のパディング
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding-top: 160px; // SPではカテゴリーとフィルター分の余白を追加
  }
`;

const FilterContainer = styled.div`
  position: fixed;
  top: 140px; // カテゴリーの下に配置
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);

  @media (max-width: 768px) {
    top: 120px; // SPではカテゴリーの下に配置
    padding: 0.5rem 1rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
  min-width: 0;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.2rem;
    align-items: stretch;
    width: 100%;
  }
`;

const FilmContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 60px; // フィルター分の余白を追加

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
    margin-top: 40px; // SPでは余白を調整
  }
`;

// フィルムストリップ全体
const FilmStripRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  position: relative;
  width: 100%;
  max-width: 100vw;
  margin: 0;
  background: #111;
  border-radius: 0;
  box-shadow: none;
  min-height: 320px;
  padding: 0;
  overflow-x: visible;
  align-items: stretch;
  @media (max-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    max-width: 100vw;
    width: 100vw;
    margin: 0;
    min-height: 220px;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    background: none;
    overflow-x: hidden;
    align-items: stretch;
  }
  @media (max-width: 600px) {
    gap: 0;
    min-height: 160px;
    padding: 0;
    align-items: stretch;
  }
`;
// 上下黒帯
const FilmStripBand = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 32px;
  background: #000;
  z-index: 2;
`;
const FilmStripBandTop = styled(FilmStripBand)`
  top: 0;
  border-radius: 16px 16px 0 0;
  @media (max-width: 1024px) {
    display: none;
  }
`;
const FilmStripBandBottom = styled(FilmStripBand)`
  bottom: 0;
  border-radius: 0 0 16px 16px;
  @media (max-width: 1024px) {
    display: none;
  }
`;
// 穴（パーフォレーション）
const FilmStripHoles = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  z-index: 3;
  pointer-events: none;
`;
const FilmStripHolesTop = styled(FilmStripHoles)`
  top: 6px;
  @media (max-width: 1024px) {
    display: none;
  }
`;
const FilmStripHolesBottom = styled(FilmStripHoles)`
  bottom: 6px;
  @media (max-width: 1024px) {
    display: none;
  }
`;
const FilmHole = styled.div`
  width: 24px;
  height: 14px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px #0004;
`;
// 画像間の仕切り線
const FilmDivider = styled.div`
  display: none;
`;

// GalleryImageはImageのラッパー用スタイルだけに
const GalleryImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  height: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`;

const Caption = styled.div`
  width: 100%;
  padding: 1.2rem 0.5rem 0.7rem 0.5rem;
  text-align: center;
  color: #fff;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  font-size: 1.25rem;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 8px #000, 0 0 2px #b8941f;
  background: linear-gradient(0deg, rgba(10,10,10,0.85) 60%, transparent 100%);
  border-radius: 0 0 12px 12px;
`;

// フィルム風モーダル
const FilmModalFrame = styled.div<{ $isPortrait?: boolean }>`
  position: relative;
  background: #111;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 4px #000;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${props => props.$isPortrait ? '400px' : '600px'};
  min-height: ${props => props.$isPortrait ? '600px' : '400px'};
  width: ${props => props.$isPortrait ? '40vw' : '60vw'};
  height: auto;
  aspect-ratio: ${props => props.$isPortrait ? '2/3' : '4/3'};
  margin: 0 auto;
  @media (max-width: 1024px) {
    min-width: 220px;
    width: 90vw;
    min-height: 220px;
    aspect-ratio: ${props => props.$isPortrait ? '2/3' : '4/3'};
  }
  @media (max-width: 600px) {
    min-width: 0;
    width: 100vw;
    min-height: 0;
    height: 100svh;
    min-height: 100svh;
    max-height: 100svh;
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
    box-sizing: border-box;
    aspect-ratio: unset;
    border-radius: 0;
    box-shadow: none;
    margin: 0;
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 0);
    align-items: stretch;
    justify-content: stretch;
    overflow: hidden;
    position: fixed;
    inset: 0;
  }
`;
const FilmModalBand = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 32px;
  background: #000;
  z-index: 2;
`;
const FilmModalBandTop = styled(FilmModalBand)`
  top: 0;
  border-radius: 16px 16px 0 0;
`;
const FilmModalBandBottom = styled(FilmModalBand)`
  bottom: 0;
  border-radius: 0 0 16px 16px;
`;
const FilmModalHoles = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  z-index: 3;
  pointer-events: none;
`;
const FilmModalHolesTop = styled(FilmModalHoles)`
  top: 6px;
`;
const FilmModalHolesBottom = styled(FilmModalHoles)`
  bottom: 6px;
`;
const FilmModalHole = styled.div`
  width: 24px;
  height: 14px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px #0004;
`;
const ModalArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.6);
  border: none;
  color: #fff;
  font-size: 2.5rem;
  z-index: 10;
  cursor: pointer;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover { background: #d4af37; color: #111; }
  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
    font-size: 2rem;
  }
`;
const ModalArrowLeft = styled(ModalArrow)`
  left: -60px;
  @media (max-width: 600px) {
    left: 10px;
  }
`;
const ModalArrowRight = styled(ModalArrow)`
  right: -60px;
  @media (max-width: 600px) {
    right: 10px;
  }
`;

// モーダル用: 前後画像のサムネイル
const ModalSideThumb = styled.img<{
  $side: 'left' | 'right';
}>`
  position: absolute;
  top: 50%;
  ${props => props.$side === 'left' ? 'left: 12px;' : 'right: 12px;'}
  transform: translateY(-50%) scale(0.7);
  width: 30%;
  height: 70%;
  object-fit: cover;
  opacity: 0.5;
  filter: blur(1.5px) grayscale(30%);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  cursor: pointer;
  z-index: 7;
  transition: opacity 0.2s, filter 0.2s;
  &:hover {
    opacity: 0.8;
    filter: blur(0.5px) grayscale(10%);
  }
  @media (max-width: 1024px) {
    width: 28%;
    height: 60%;
    ${props => props.$side === 'left' ? 'left: 4px;' : 'right: 4px;'}
  }
  @media (max-width: 600px) {
    width: 32%;
    height: 50%;
    ${props => props.$side === 'left' ? 'left: 2px;' : 'right: 2px;'}
  }
`;

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadedArr, setIsLoadedArr] = useState<boolean[]>([]);
  const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const PHOTOS_PER_PAGE = 12;
  const modalImageWrapperRef = useRef<HTMLDivElement | null>(null);
  const [modalKey, setModalKey] = useState('');

  // microCMSから画像を取得
  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const { photos: fetched, totalCount } = await getPhotos({ limit: PHOTOS_PER_PAGE, offset: 0 });
        // 仮のロジック: 取得した順にportrait, bath, personを割り振る
        const categories: Category[] = ['portrait', 'bath', 'person'];
        const withMeta = fetched.map((p, i) => ({
          ...p,
          category: categories[i % categories.length],
          date: '2024-03-01'
        }));
        setPhotos(withMeta);
        setFilteredPhotos(withMeta);
        setTotalCount(totalCount);
      } catch {
        setPhotos([]);
        setFilteredPhotos([]);
        setTotalCount(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    let filtered = photos;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(photo => photo.category === selectedCategory);
    }
    if (selectedDate !== 'all') {
      filtered = filtered.filter(photo => photo.date.startsWith(selectedDate));
    }
    setFilteredPhotos(filtered);
  }, [selectedCategory, selectedDate, photos]);

  useEffect(() => {
    setIsLoadedArr(prev => {
      if (filteredPhotos.length > prev.length) {
        return [...prev, ...Array(filteredPhotos.length - prev.length).fill(false)];
      }
      return prev.slice(0, filteredPhotos.length);
    });
  }, [filteredPhotos.length]);

  // カテゴリーの一覧
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'bath', label: 'Bath' },
    { value: 'person', label: 'Person' }
  ];

  // 日付の一覧（実際のデータから生成）
  const dates = [
    { value: 'all', label: 'All' },
    { value: '2024-03', label: '2024/3' },
    { value: '2024-02', label: '2024/2' },
    // 他の日付を追加
  ];

  const handlePhotoClick = (photo: Photo, idx: number) => {
    setCurrentModalIndex(idx);
    setIsModalOpen(true);
  };

  // 無限スクロール: 追加取得
  const fetchMorePhotos = useCallback(async () => {
    if (isFetchingMore) return;
    if (photos.length >= (totalCount || 0)) return;
    setIsFetchingMore(true);
    try {
      const { photos: morePhotos } = await getPhotos({ limit: PHOTOS_PER_PAGE, offset: photos.length });
      // 仮のロジック: 取得した順にportrait, bath, personを割り振る
      const categories: Category[] = ['portrait', 'bath', 'person'];
      const withMeta = morePhotos.map((p, i) => ({
        ...p,
        category: categories[(photos.length + i) % categories.length],
        date: '2024-03-01'
      }));
      setPhotos(prev => [...prev, ...withMeta]);
      setFilteredPhotos(prev => [...prev, ...withMeta]);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, photos.length, totalCount, PHOTOS_PER_PAGE]);

  // IntersectionObserverで下端検知
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePhotos();
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    // 修正: refを変数に退避
    const currentLoader = loaderRef.current;
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [fetchMorePhotos]);

  // モーダルを開くたびにズレを最大限防ぐ
  useEffect(() => {
    if (isModalOpen && modalImageWrapperRef.current) {
      // 1回目即時リセット
      modalImageWrapperRef.current.scrollTop = 0;
      modalImageWrapperRef.current.scrollIntoView({ block: 'center' });
      // 2回目遅延リセット
      setTimeout(() => {
        if (modalImageWrapperRef.current) {
          modalImageWrapperRef.current.scrollTop = 0;
          modalImageWrapperRef.current.scrollIntoView({ block: 'center' });
        }
      }, 50);
      // 3回目さらに遅延リセット
      setTimeout(() => {
        if (modalImageWrapperRef.current) {
          modalImageWrapperRef.current.scrollTop = 0;
          modalImageWrapperRef.current.scrollIntoView({ block: 'center' });
        }
      }, 150);
    }
  }, [isModalOpen, currentModalIndex, modalKey]);

  // モーダルを開くたびにkeyを画像URL+タイムスタンプで更新
  useEffect(() => {
    if (isModalOpen && currentModalIndex !== null) {
      setModalKey(filteredPhotos[currentModalIndex].url + '-' + Date.now());
    }
  }, [isModalOpen, currentModalIndex]);

  return (
    <GalleryContainer>
      <Header />
      <FilterContainer>
        <FilterGroup>
          <CustomSelect
            options={categories}
            value={selectedCategory}
            onChange={v => setSelectedCategory(v as Category)}
            label="Category:"
          />
        </FilterGroup>
        <FilterGroup>
          <CustomSelect
            options={dates}
            value={selectedDate}
            onChange={v => setSelectedDate(v)}
            label="Date:"
          />
        </FilterGroup>
      </FilterContainer>
      <FilmContainer>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ position: 'relative', width: '100%' }}>
            <FilmStripBandTop />
            <FilmStripBandBottom />
            <FilmStripHolesTop>
              {Array.from({ length: filteredPhotos.length * 2 + 1 }).map((_, i) => <FilmHole key={i} />)}
            </FilmStripHolesTop>
            <FilmStripHolesBottom>
              {Array.from({ length: filteredPhotos.length * 2 + 1 }).map((_, i) => <FilmHole key={i} />)}
            </FilmStripHolesBottom>
            <FilmStripRow>
              {filteredPhotos.map((photo, idx) => {
                // PCのみ仕切り線を出力
                if (typeof window !== 'undefined' && window.innerWidth > 1024 && idx !== 0) {
                  return [
                    <FilmDivider key={`divider-${photo.id}-divider`} />,
                    <div
                      key={`frame-${photo.id}`}
                      onClick={() => handlePhotoClick(photo, idx)}
                      tabIndex={0}
                      role="button"
                      aria-label={`拡大表示: ${photo.title}`}
                      style={{
                        cursor: 'pointer',
                        position: 'relative',
                        boxSizing: 'border-box',
                        margin: 0,
                        padding: 0,
                        borderRadius: 0,
                        boxShadow: 'none',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <GalleryImageWrapper>
                        <Image
                          src={photo.url + '?w=400&fm=webp'}
                          alt={photo.title}
                          width={400}
                          height={400}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 0,
                            filter: 'sepia(12%) contrast(1.08) brightness(1.08) saturate(1.1)',
                            opacity: isLoadedArr[idx] ? 1 : 0,
                            transition: 'opacity 0.2s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: 'none',
                            margin: 0,
                            padding: 0,
                          }}
                          onLoad={() => {
                            setIsLoadedArr(prev => {
                              const next = [...prev];
                              next[idx] = true;
                              return next;
                            });
                          }}
                          priority={idx < 6}
                          placeholder="blur"
                          blurDataURL={photo.url + '?w=10&blur=20&fm=webp'}
                          unoptimized={false}
                          loading={idx < 6 ? 'eager' : 'lazy'}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </GalleryImageWrapper>
                      <Caption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4 }}>{photo.title}</Caption>
                    </div>
                  ];
                }
                // タブレット・SPは画像だけ
                return (
                  <div
                    key={`frame-${photo.id}`}
                    onClick={() => handlePhotoClick(photo, idx)}
                    tabIndex={0}
                    role="button"
                    aria-label={`拡大表示: ${photo.title}`}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      boxSizing: 'border-box',
                      margin: 0,
                      padding: 0,
                      borderRadius: 0,
                      boxShadow: 'none',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <GalleryImageWrapper>
                      <Image
                        src={photo.url + '?w=400&fm=webp'}
                        alt={photo.title}
                        width={400}
                        height={400}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 0,
                          filter: 'sepia(12%) contrast(1.08) brightness(1.08) saturate(1.1)',
                          opacity: isLoadedArr[idx] ? 1 : 0,
                          transition: 'opacity 0.2s cubic-bezier(0.4,0,0.2,1)',
                          boxShadow: 'none',
                          margin: 0,
                          padding: 0,
                        }}
                        onLoad={() => {
                          setIsLoadedArr(prev => {
                            const next = [...prev];
                            next[idx] = true;
                            return next;
                          });
                        }}
                        priority={idx < 6}
                        placeholder="blur"
                        blurDataURL={photo.url + '?w=10&blur=20&fm=webp'}
                        unoptimized={false}
                        loading={idx < 6 ? 'eager' : 'lazy'}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </GalleryImageWrapper>
                    <Caption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4 }}>{photo.title}</Caption>
                  </div>
                );
              })}
            </FilmStripRow>
            {/* 無限スクロール用ローダー */}
            <div ref={loaderRef} style={{ height: 32 }} />
            {isFetchingMore && <div style={{ textAlign: 'center', color: '#d4af37', margin: 8 }}>Loading...</div>}
            {photos.length >= (totalCount || 0) && (
              <div style={{ textAlign: 'center', color: '#888', margin: 8, fontSize: '0.95rem' }}>すべての写真を表示しました</div>
            )}
          </div>
        )}
      </FilmContainer>
      {isModalOpen && currentModalIndex !== null && (
        <div
          key={modalKey}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setIsModalOpen(false)}
        >
          <FilmModalFrame
            $isPortrait={(() => {
              const img = filteredPhotos[currentModalIndex];
              const match = img.url.match(/[?&]h=(\d+)/);
              const h = match ? parseInt(match[1], 10) : undefined;
              const wMatch = img.url.match(/[?&]w=(\d+)/);
              const w = wMatch ? parseInt(wMatch[1], 10) : undefined;
              if (w && h) return h > w;
              return false;
            })()}
            onClick={e => e.stopPropagation()}
          >
            <FilmModalBandTop />
            <FilmModalBandBottom />
            <FilmModalHolesTop>
              {Array.from({ length: 9 }).map((_, i) => <FilmModalHole key={i} />)}
            </FilmModalHolesTop>
            <FilmModalHolesBottom>
              {Array.from({ length: 9 }).map((_, i) => <FilmModalHole key={i} />)}
            </FilmModalHolesBottom>
            {/* 左右サムネイル（前後画像） */}
            {currentModalIndex > 0 && (
              <ModalSideThumb
                src={filteredPhotos[currentModalIndex - 1].url}
                alt={filteredPhotos[currentModalIndex - 1].title}
                $side="left"
                onClick={() => setCurrentModalIndex(currentModalIndex - 1)}
              />
            )}
            {currentModalIndex < filteredPhotos.length - 1 && (
              <ModalSideThumb
                src={filteredPhotos[currentModalIndex + 1].url}
                alt={filteredPhotos[currentModalIndex + 1].title}
                $side="right"
                onClick={() => setCurrentModalIndex(currentModalIndex + 1)}
              />
            )}
            {currentModalIndex > 0 && (
              <ModalArrowLeft onClick={() => setCurrentModalIndex(currentModalIndex - 1)} aria-label="前の写真へ">&#8592;</ModalArrowLeft>
            )}
            {currentModalIndex < filteredPhotos.length - 1 && (
              <ModalArrowRight onClick={() => setCurrentModalIndex(currentModalIndex + 1)} aria-label="次の写真へ">&#8594;</ModalArrowRight>
            )}
            <div
              ref={modalImageWrapperRef}
              style={{ position: 'absolute', inset: 0, width: '100vw', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, overflow: 'hidden', padding: 0, margin: 0 }}
            >
              <Image
                src={filteredPhotos[currentModalIndex].url + '?w=1200&fm=webp'}
                alt={filteredPhotos[currentModalIndex].title}
                fill
                style={{
                  objectFit: 'contain',
                  width: '100vw',
                  height: '100%',
                  maxWidth: '100vw',
                  maxHeight: 'calc(100% - env(safe-area-inset-top, 0) - env(safe-area-inset-bottom, 0))',
                  borderRadius: '6px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
                  background: '#222',
                  zIndex: 5,
                  margin: 0,
                  padding: 0,
                  display: 'block'
                }}
                loading="eager"
                priority
              />
            </div>
            <Caption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6 }}>{filteredPhotos[currentModalIndex].title}</Caption>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 24, cursor: 'pointer' }}
              aria-label="閉じる"
            >×</button>
          </FilmModalFrame>
        </div>
      )}
    </GalleryContainer>
  );
} 